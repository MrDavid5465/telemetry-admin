pub mod app_config;
pub mod builtin_templates;
pub mod dashboard_files;
pub mod clients;
pub mod car;
pub mod templates;
pub mod dashboard_entry;
pub mod gamepad;
pub mod shaker_dsp;
pub use car::{CarFileMutation, CarPhotoSyncQuery};
pub use templates::DashTemplateThumbnailMutation;
pub use dashboard_entry::DashboardMutation;
pub use gamepad::GamepadMutation;
pub use shaker_dsp::{ShakerDspMutation, ShakerDspQuery};

use async_graphql::{Object, Subscription};
use futures_util::stream::{Stream, StreamExt, select};
use tokio_stream::wrappers::IntervalStream;
use std::time::Duration;
use crate::telemetry::{types::{SimStatus, TelemetryFrame, TyreData, CourseFlag}, simdata::SimData, read_simdata};
use crate::typiql_types::{DashboardEntryChanged, DashTemplateChanged, DeviceDefaultChanged};
use typiql::TypiQLBroker;

#[derive(async_graphql::SimpleObject, Clone)]
pub struct TelemetryEvent {
    pub frame: Option<TelemetryFrame>,
}

#[derive(async_graphql::Union, Clone)]
enum DashboardUpdateEvent {
    Dashboard(DashboardEntryChanged),
    Template(DashTemplateChanged),
    DeviceDefault(DeviceDefaultChanged),
    Telemetry(TelemetryEvent),
}

fn build_frame(d: SimData) -> TelemetryFrame {
    TelemetryFrame {
        sim_status: match d.simstatus {
            1 => SimStatus::Menu,
            2 => SimStatus::Active,
            _ => SimStatus::Off,
        },
        simon:    d.simon,
        car:      d.car_name().to_string(),
        track:    d.track_name().to_string(),
        driver:   d.driver_name().to_string(),
        tyre_compound: std::ffi::CStr::from_bytes_until_nul(&d.tyre_compound)
            .map(|s| s.to_str().unwrap_or("").to_string())
            .unwrap_or_default(),

        g_lat:    d.g_lat(),
        g_lon:    d.g_lon(),
        g_vert:   d.g_vert(),
        heading:  d.heading,
        pitch:    d.pitch,
        roll:     d.roll,

        speed:      d.velocity as f64,
        rpm:        d.rpms,
        max_rpm:    d.maxrpm,
        idle_rpm:   d.idlerpm,
        gear:       d.gear_display(),
        max_gears:  d.maxgears,
        throttle:   d.gas,
        brake:      d.brake,
        clutch:     d.clutch,
        steering:   d.steer,
        handbrake:  d.handbrake,
        abs:        d.abs,
        brake_bias: d.brakebias,

        fuel:          d.fuel,
        fuel_capacity: d.fuelcapacity,
        turbo_boost:   d.turboboost,
        turbo_pct:     d.turboboostperct,

        tyres: (0..4).map(|i| TyreData {
            temp:       d.tyre_temp[i],
            pressure:   d.tyre_pressure[i],
            slip_ratio: d.tyre_slip_ratio[i],
            slip_angle: d.tyre_slip_angle[i],
            wear:       d.tyre_wear[i],
            brake_temp: d.brake_temp[i],
            rps:        d.tyre_rps[i],
            diameter:   d.tyre_diameter[i],
        }).collect(),

        air_temp:    d.air_temp,
        track_temp:  d.track_temp,
        air_density: d.air_density,

        lap:       d.lap,
        position:  d.position,
        num_laps:  d.numlaps,
        num_cars:  d.numcars,
        course_flag: match d.course_flag {
            1 => CourseFlag::Yellow,
            2 => CourseFlag::Red,
            3 => CourseFlag::Chequered,
            4 => CourseFlag::Blue,
            5 => CourseFlag::White,
            6 => CourseFlag::Black,
            7 => CourseFlag::BlackWhite,
            8 => CourseFlag::BlackOrange,
            9 => CourseFlag::Orange,
            _ => CourseFlag::Green,
        },
        lap_is_valid:         d.lap_is_valid,
        in_pit:               d.cars[0].inpit,
        current_lap_seconds:  d.current_lap_seconds,
        last_lap_seconds:     d.last_lap_seconds,
        sector1_time:         d.sector1_time,
        sector2_time:         d.sector2_time,
    }
}

#[derive(Default)]
pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn telemetry_snapshot(&self) -> Option<TelemetryFrame> {
        read_simdata().map(build_frame)
    }
}

#[derive(Default)]
pub struct SubscriptionRoot;

#[Subscription]
impl SubscriptionRoot {
    async fn tick(&self) -> impl Stream<Item = i32> {
        IntervalStream::new(tokio::time::interval(Duration::from_secs(1)))
            .enumerate()
            .map(|(i, _)| i as i32)
    }
    async fn telemetry(&self) -> impl Stream<Item = Option<TelemetryFrame>> {
        IntervalStream::new(tokio::time::interval(Duration::from_millis(33)))
            .map(|_| read_simdata().map(build_frame))
    }

    async fn dashboard_updates(&self) -> impl Stream<Item = DashboardUpdateEvent> {
        let s1 = TypiQLBroker::<DashboardEntryChanged>::subscribe().map(DashboardUpdateEvent::Dashboard);
        let s2 = TypiQLBroker::<DashTemplateChanged>::subscribe().map(DashboardUpdateEvent::Template);
        let s3 = TypiQLBroker::<DeviceDefaultChanged>::subscribe().map(DashboardUpdateEvent::DeviceDefault);
        let s4 = IntervalStream::new(tokio::time::interval(Duration::from_millis(16)))
            .map(|_| DashboardUpdateEvent::Telemetry(TelemetryEvent { frame: read_simdata().map(build_frame) }));
        select(s4, select(s1, select(s2, s3)))
    }
}

