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

// Import the LinkedUp canister. We need this to make inter-canister calls to it!
#[import(canister = "linkedup")]
struct LinkedUp;

// Define our own Profile struct. There is a Profile struct automatically imported
// since the linkedup cansiter was imported, but due to a bug with our current version
// of dfx, the imported Profile has the wrong type for `id` (it's not a Principal
// type). So for now, we use this slightly modified version called Profile2.
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

// Datatype for storing videos.
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct Video {
    video_id: String,
    file: String,
    title: String,
    creator: Principal,
    views: u64,
    likes: Vec<Principal>,
    tags: Vec<String>,
}

#[derive(Clone, Default, Debug, CandidType, Serialize)]
struct User {
    subscriptions: Vec<Principal>,
}

type Users = BTreeMap<Principal, User>;
type Store = BTreeMap<String, Video>;

// Returns the user's profile from LinkedUp.
#[update]
async fn get_profile() -> Box<Profile2> {
    // This is the canister id of the canister running LinkedUp
    let linkedupid = ic_cdk::export::Principal::from_text("7kncf-oidaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-q").unwrap();
    // There is only one for LinkedUp's `get` function: the id of the user.
    let args = (ic_cdk::api::caller(),);
    // Call the `get` function from LinkedUp, expecting the return type to be a Profile (but wrapped in a tuple).
    let profile: (Profile2,) = ic_cdk::call(linkedupid, "get", args).await.unwrap();
    Box::new(profile.0)
}

// Calls the LinkedUp getConnections method, which returns an array of connected profiles for the given user id.
#[update]
async fn get_connections() -> Vec<Principal> {
    let linkedupid = ic_cdk::export::Principal::from_text("7kncf-oidaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-q").unwrap();
    let args = (ic_cdk::api::caller(),);
    let connections: (Vec<Profile2>,) = ic_cdk::call(linkedupid, "getConnections", args).await.unwrap();
    connections.0.iter().map(|c| c.id.clone()).collect()
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

// Returns the principal id for the current user.
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

// Adds a video to our database.
#[update] // (guard = "is_user")]
fn store(title: String, contents: String, t: Vec<String>) -> String {
    // contents is in format "data:image/jpeg;base64,/9j/2wBDAAICAgICAgMCAgMFAwMDBQ..."
    if (contents[5..10].eq("image") || contents[5..10].eq("video")) {
        let store = storage::get_mut::<Store>();
        let id = Uuid::new_v3(&Uuid::NAMESPACE_URL, &contents.as_bytes())
                    .to_simple().to_string();
        store.insert(id.clone(), Video {
            video_id: id.clone(),
            file: contents,
            title: title,
            creator: ic_cdk::api::caller(),
            likes: Vec::new(),
            views: 0,
            tags: t,
        });
        id
    } else {
        panic!("Wrong File Type!")
    }
}

// Subscribes to another user. This influences the recommended videos for the current user.
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

// Retrieve a video and its metadata.
#[query]
fn retrieve(path: String) -> &'static Video {
    let store = storage::get::<Store>();

    match store.get(&path) {
        Some(content) => content,
        None => panic!("Path {} not found.", path),
    }
}

#[update]
fn likeVideo(path: String) {
    let store = storage::get_mut::<Store>();
    let sub = ic_cdk::api::caller();
    if let video = store.get_mut(&path) {
        match video {
            Some(v) => if !v.likes.contains(&sub) {
                v.likes.push(sub)
            },
            None    => panic!("video {} not found.", path),
        }
    } else {
        panic!("video {} not found.", path);
    }
}

#[update(guard = "is_user")]
fn add_user(principal: Principal) {
    let users = storage::get_mut::<Users>();
    users.insert(principal, User::default());
}

#[update]
//gets videos which connections have posted for the feed
async fn connections_vids() -> Vec<&'static Video> {
    let connections = get_connections().await;
    let store = storage::get::<Store>();

    let videos = store.values();
    videos.filter(|v| connections.contains(&v.creator)).collect()
}

#[query]
fn all() -> Vec<&'static Video> {
    let store = storage::get::<Store>();
    store.values().collect()
}

fn text_has(v: &Video, text: &str) -> bool {
    // heuristic that the distance between keyword and title is less than half the search length
    v.title.to_ascii_lowercase().contains(text)
}

fn text_match(a: &Video, b: &Video, text: &str) -> Ordering {
    // Sort by levenshtein distance and then by alphanumeric title
    match a.title.len().cmp(&b.title.len()) {
        Ordering::Equal => a.title.cmp(&b.title),
        ord => ord,
    }
}

#[query]
fn search(query: String) -> Vec<&'static Video> {
    let lowerquery = query.to_ascii_lowercase();
    let store = storage::get::<Store>();
    let mut videos: Vec<&'static Video> =
        store.values().filter(|v| text_has(v, &lowerquery)).collect();
    videos.sort_by(|a, b| text_match(a, b, &lowerquery));
    videos
}

#[pre_upgrade]
fn pre_upgrade() {
    let vec: Vec<(String, Video)> = storage::get::<Store>().iter()
        .map(|(k,v)| (k.clone(), v.clone())).collect();
    storage::stable_save((vec,)).unwrap();
}

#[post_upgrade]
fn post_upgrade() {
    try_post_upgrade().unwrap_or_else(|e| {
        ic_cdk::println!("Error upgrading: {:?}", e);
    });
}

fn try_post_upgrade() -> Result<(), String> {
    let (old_storage,): (Vec<(String, Video)>,) = storage::stable_restore()?;
    for (id, vid) in old_storage {
        storage::get_mut::<Store>().insert(id, vid);
    }
    Ok(())
}
