// ic_cdk::println!("", );

use ic_cdk::storage;
use ic_cdk_macros::*;
use ic_types::Principal;
use std::collections::{BTreeMap, BTreeSet};
use ic_cdk::export::candid;
use ic_cdk::export::candid::CandidType;
use uuid::Uuid;
use serde::{Deserialize,Serialize};
use core::cmp::Ordering;

#[import(canister = "linkedup")]
struct LinkedUp;

#[derive(Clone, Debug, CandidType, Serialize)]
struct Video {
    file: String,
    title: String,
    creator: Principal,
    views: u64,
    likes: u64
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Profile2 {
    id: Principal,
    firstName: String,
    lastName: String,
    title: String,
    company: String,
    experience: String,
    education: String,
    imgUrl: String,
}

#[derive(Clone, Default, Debug, CandidType, Serialize)]
struct User {
    subscriptions: Vec<Principal>,
}

type Users = BTreeMap<Principal, User>;
type Store = BTreeMap<String, Video>;

#[update]
async fn get_profile() -> Box<Profile2> {
    let linkedupid = ic_cdk::export::Principal::from_text("do2cr-xieaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-q").unwrap();
    let args = (ic_cdk::api::caller(),);
    let profile: (Profile2,) = ic_cdk::call(linkedupid, "get", args).await.unwrap();
    Box::new(profile.0)
}

#[update]
async fn get_connections() -> Vec<UserId> {
    let linkedupid = ic_cdk::export::Principal::from_text("do2cr-xieaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-q").unwrap();
    let args = (ic_cdk::api::caller(),);
    let connections: (Vec<UserId>,) = ic_cdk::call(linkedupid, "getConnections", args).await.unwrap();
    connections.0

}

// async fn is_connection() -> bool {
//     let linkedupid = ic_cdk::export::Principal::from_text("do2cr-xieaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-q").unwrap();
//     let args = (ic_cdk::api::caller(),);
//     let isConnected: bool = ic_cdk::call(linkedupid, "getConnections", args).await.unwrap();
// }

#[init]
fn init() {
    let users = storage::get_mut::<Users>();
    users.insert(ic_cdk::api::caller(), User::default());
}

#[query]
fn whoami() -> ic_types::Principal {
   ic_cdk::api::caller()
}

fn is_user() -> Result<(), String> {
    let users = storage::get::<Users>();

    if users.contains_key(&ic_cdk::api::caller()) {
        Ok(())
    } else {
        Err("Store can only be set by the owner of the asset canister.".to_string())
    }
}

#[update] // (guard = "is_user")]
fn store(title: String, contents: String) -> String {
    let store = storage::get_mut::<Store>();
    let id = Uuid::new_v3(&Uuid::NAMESPACE_URL, &contents.as_bytes())
                .to_simple().to_string();
    store.insert(id.clone(), Video {
        file: contents,
        title: title,
        creator: ic_cdk::api::caller(),
        likes: 0,
        views: 0,
    });
    id
}

#[update]
fn subscribe(sub: ic_types::Principal) {
    let users = storage::get_mut::<Users>();
    let caller= ic_cdk::api::caller();
    if let Some(user) = users.get_mut(&caller) {
        user.subscriptions.push(sub);
    } else {
        panic!("User {} not found.", caller);
    }
}

#[query]
fn retrieve(path: String) -> &'static Video {
    let store = storage::get::<Store>();

    match store.get(&path) {
        Some(content) => content,
        None => panic!("Path {} not found.", path),
    }
}

#[update(guard = "is_user")]
fn add_user(principal: Principal) {
    let users = storage::get_mut::<Users>();
    users.insert(principal, User::default());
}

#[query]
fn connections_vids() -> Vec<&'static Video> {
    let connections: (Vec<UserId>,) = get_connections();
    let store = storage::get::<Store>();
    let videos = store.values;
    videos.filter(|v| connections.contains(v.creator)).collect()

}

#[query]
fn all() -> Vec<&'static Video> {
    let store = storage::get::<Store>();
    store.values().collect()
}

// This could be a whole lot more efficient...
// This is levenshtein distance, but with no penalties for insertion
fn levenshtein_distance(a: &str, b: &str) {
    if a.len()  == 0 {
        b.len()
    } else if b.len() == 0 {
        a.len()
    } else if (a[0] == b[0]) {
        levenshtein_distance(a[1:], b[1]:)
    } else {
        levenshtein_distance(a[1:], b)
            .min(1 + levenshtein_distance(a, b[1:]))
            .min(levenshtein_distance(a[1:], b[1:]))
    }
}

fn text_has(v: &Video, text: &str) {
    // heuristic that the distance between keyword and title is less than half the search length
    levenshtein_distance(v.title, text) < text.len() / 2
}

fn text_match(a: &Video, b: &Video, text: &str) -> Ordering {
    // Sort by levenshtein distance and then by alphanumeric title
    match levenshtein_distance(a.title, text).cmp(&levenshtein_distance(b.title, text)) {
        Ordering::Equal => a.title.cmp(b.title),
        ord => ord,
    }
}

#[query]
fn search(query: String) -> Vec<&'static Video> {
    let store = storage::get::<Store>();
    let mut videos: Vec<&'static Video> =
        store.values().filter(|v| text_has(v, text).collect();
    videos.sort_by(|a, b| text_match(a, b, &query));
    videos
}

#[pre_upgrade]
fn pre_upgrade() {
    let mut vec = storage::get_mut::<Store>.into_iter().collect();
    storage::stable_save((vec,)).unwrap();
}

#[post_upgrade]
fn post_upgrade() {
    let (old_storage,): (Vec<(String, Video)>,) = storage::stable_restore().unwrap();
    for (id, vid) in old_storage {
        storage::get_mut::<Store>().insert(id, vid);
    }
}
