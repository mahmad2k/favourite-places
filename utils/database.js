import * as SQLite from "expo-sqlite";
import { Place } from "../models/places";

const database = SQLite.openDatabase("places.db");

export async function init() {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        imageUri TEXT NOT NULL,
        address TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL      
      )`,
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}

export async function insertPlace(place) {
  const { title, imageUri, address, location } = place;
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO places (title, imageUri, address, lat, lng)
        VALUES (?, ?, ?, ?, ?)`,
        [title, imageUri, address, location.lat, location.lng],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
}

export async function fetchPlaces() {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM places`,
        [],
        (_, result) => {
          const places = [];
          for (const place of result.rows._array) {
            const { id, title, imageUri, address, lat, lng } = place;
            places.push(new Place(title, imageUri, { lat, lng, address }, id));
          }
          resolve(places);
        },
        (_, error) => reject(error)
      );
    });
  });
}

export function fetchPlaceDetails(placeId) {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM places WHERE id = ?`,
        [placeId],
        (_, result) => {
          const place = result.rows._array[0];
          const { title, imageUri, address, lat, lng, id } = place;
          resolve(new Place(title, imageUri, { lat, lng, address }, id));
        },
        (_, error) => reject(error)
      );
    });
  });
}
