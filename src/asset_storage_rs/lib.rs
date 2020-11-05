use ic_cdk::storage;
use ic_cdk_macros::*;
use ic_types::Principal;
use std::collections::{BTreeMap, BTreeSet};
use ic_cdk::export::candid;
use ic_cdk::export::candid::CandidType;
use uuid::Uuid;
use serde::{Deserialize,Serialize};

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

// #[pre_upgrade]
// fn pre_upgrade() {
//     let mut vec = Vec::new();
//     for p in storage::get_mut::<Users>().iter() {
//         vec.push(p);
//     }
//     storage::stable_save((vec,)).unwrap();
// }

// #[post_upgrade]
// fn post_upgrade() {
//     let (old_users,): (Vec<Principal>,) = storage::stable_restore().unwrap();
//     for u in old_users {
//         storage::get_mut::<Users>().insert(u);
//     }
// }
