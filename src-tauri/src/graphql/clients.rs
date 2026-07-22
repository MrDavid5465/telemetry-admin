use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use async_graphql::{Context, Object, Result as GqlResult};
use serde_json::json;
use typiql::TypiQLAdapter;
use crate::typiql_types::ConnectedClient;

#[derive(Default)]
pub struct ClientsMutation;

#[Object]
impl ClientsMutation {
    async fn heartbeat_client(
        &self,
        ctx: &Context<'_>,
        id: String,
        name: Option<String>,
    ) -> GqlResult<ConnectedClient> {
        let adapter = ctx.data::<Arc<dyn TypiQLAdapter>>()?;
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
            .to_string();

        let existing = adapter.get_one("connected_clients".into(), "id", &id).await;
        let result_val = if existing.is_some() {
            let mut update = json!({ "last_seen": now });
            if let Some(n) = &name {
                update["name"] = json!(n);
            }
            adapter
                .update("connected_clients".into(), "id", &id, update)
                .await
                .ok_or_else(|| async_graphql::Error::new("Update failed"))?
        } else {
            adapter
                .add(
                    "connected_clients".into(),
                    "id",
                    json!({
                        "id": id,
                        "name": name,
                        "last_seen": now,
                    }),
                )
                .await
                .map_err(async_graphql::Error::new)?
        };

        serde_json::from_value(result_val).map_err(|e| async_graphql::Error::new(e.to_string()))
    }

    async fn register_car(&self, ctx: &Context<'_>, name: String) -> GqlResult<bool> {
        let adapter = ctx.data::<Arc<dyn TypiQLAdapter>>()?;
        let existing = adapter.get_one("known_cars".into(), "id", &name).await;
        if existing.is_none() {
            adapter
                .add("known_cars".into(), "id", json!({ "id": name, "name": name }))
                .await
                .map_err(|e| async_graphql::Error::new(e))?;
            return Ok(true);
        }
        Ok(false)
    }
}
