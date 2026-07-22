pub mod simdata;
pub mod types;
use simdata::SimData;
use memmap2::MmapOptions;
use std::fs::File;

const SIMAPI_PATH: &str = "/dev/shm/SIMAPI.DAT";

pub fn read_simdata() -> Option<SimData> {
    let file = File::open(SIMAPI_PATH).map_err(|e| {
        eprintln!("Failed to open SIMAPI.DAT: {e}");
        e
    }).ok()?;

    let mmap = unsafe { MmapOptions::new().map(&file).map_err(|e| {
        eprintln!("Failed to mmap: {e}");
        e
    }).ok()? };

    let expected = std::mem::size_of::<SimData>();
    if mmap.len() < expected {
        eprintln!("SIMAPI.DAT too small: {} < {expected}", mmap.len());
        return None;
    }

    let data = unsafe { std::ptr::read_unaligned(mmap.as_ptr() as *const SimData) };
    
    

    Some(data)
}