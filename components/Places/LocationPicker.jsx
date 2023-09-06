import { View, StyleSheet, Alert, Text, Image } from "react-native";
import {
  getCurrentPositionAsync,
  useForegroundPermissions,
  PermissionStatus,
} from "expo-location";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import OutlinedButton from "../UI/OutlineButton";
import { Colors } from "../../constants/colors";
import { useEffect, useState } from "react";
import { getAddress, getMapPreview } from "../../utils/location";

function LocationPicker({ onPickLocation }) {
  const [pickedLocation, setPickedLocation] = useState();
  const isFocused = useIsFocused();

  const { navigate } = useNavigation();
  const { params } = useRoute();

  const [locationPermissionsInformation, requestPermission] =
    useForegroundPermissions();

  useEffect(() => {
    if (isFocused && params) {
      const mapPickedLocation = params && { lat: params.lat, lng: params.lng };
      if (mapPickedLocation) {
        setPickedLocation(mapPickedLocation);
      }
    }
  }, [params, isFocused]);

  useEffect(() => {
    async function handleLocation() {
      if (!pickedLocation) {
        return;
      }

      let address = "";
      try {
        address = await getAddress(pickedLocation.lat, pickedLocation.lng);
      } catch (err) {
        Alert.alert(
          "Unable to get the address from location",
          "Couldn't get the address from location, using location instead."
        );
      }
      onPickLocation({ ...pickedLocation, address });
    }

    handleLocation();
  }, [pickedLocation, onPickLocation]);

  async function verifyPermissions() {
    if (
      locationPermissionsInformation.status === PermissionStatus.UNDETERMINED
    ) {
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }

    if (locationPermissionsInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        "Insufficient Permissions!",
        "You need to grant location permissions to use this app"
      );
      return false;
    }
    return true;
  }

  async function getLocationHandler() {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }

    const location = await getCurrentPositionAsync();
    setPickedLocation({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  }

  function pickOnMapHandler() {
    navigate("PlacesMap");
  }

  let locationPreview = <Text>No location picked yet.</Text>;

  if (pickedLocation) {
    const mapPreview = getMapPreview(pickedLocation.lat, pickedLocation.lng);

    locationPreview = <Image source={{ uri: mapPreview }} />;
  }

  return (
    <View>
      <View style={styles.mapPreview}>{locationPreview}</View>
      <View style={styles.actions}>
        <OutlinedButton icon='location' onPress={getLocationHandler}>
          Locate User
        </OutlinedButton>
        <OutlinedButton icon='map' onPress={pickOnMapHandler}>
          Pick on Map
        </OutlinedButton>
      </View>
    </View>
  );
}

export default LocationPicker;

const styles = StyleSheet.create({
  mapPreview: {
    width: "100%",
    height: 200,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    borderRadius: 4,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
