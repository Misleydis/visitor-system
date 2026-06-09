import React, { useState, useEffect, useLayoutEffect } from "react";
import {
View,
Text,
TouchableOpacity,
StyleSheet,
ScrollView,
RefreshControl,
Alert,
ImageBackground,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { getTodayVisitors, getAllVisitors } from "../services/api";

export default function SecurityDashboardScreen({ navigation }) {
const [todayVisitors, setTodayVisitors] = useState([]);
const [allVisitors, setAllVisitors] = useState([]);
const [refreshing, setRefreshing] = useState(false);
const [securityName, setSecurityName] = useState("");
const [user, setUser] = useState(null);

useEffect(() => {
loadUser();
loadData();
}, []);

const loadUser = async () => {
const userStr = await AsyncStorage.getItem("user");

if (userStr) {
const userData = JSON.parse(userStr);
setSecurityName(userData.name);
setUser(userData);
}
};

const loadData = async () => {
try {
const todayRes = await getTodayVisitors();
const allRes = await getAllVisitors();

setTodayVisitors(todayRes.data || []);
setAllVisitors(allRes.data || []);

} catch {
Alert.alert("Error", "Failed loading data");
}
};

const onRefresh = async () => {
setRefreshing(true);

await loadData();

setRefreshing(false);
};

const handleLogout = async () => {
await AsyncStorage.removeItem('token');
await AsyncStorage.removeItem('user');
navigation.replace('Login');
};

const totalToday = todayVisitors.length;

const siteCounts = {};

todayVisitors.forEach((v) => {
siteCounts[v.site] = (siteCounts[v.site] || 0) + 1;
});

const mostVisitedSite =
Object.keys(siteCounts).length > 0
? Object.keys(siteCounts).reduce((a, b) =>
siteCounts[a] > siteCounts[b] ? a : b
)
: "None";

const nationalCounts = {};

allVisitors.forEach((v) => {
nationalCounts[v.nationalId] =
(nationalCounts[v.nationalId] || 0) + 1;
});

const returningCount = Object.values(nationalCounts).filter(
(c) => c > 1
).length;

const recentVisitors = [...todayVisitors]
.sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn))
.slice(0, 5);

useLayoutEffect(() => {
navigation.setOptions({
headerRight: () => (
<TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
<MaterialIcons name="logout" size={24} color="#fff" />
</TouchableOpacity>
),
headerShown: true,
headerStyle: { backgroundColor: '#0a1929' },
headerTintColor: '#fff',
});
}, []);

return (
<ScrollView
style={styles.container}
refreshControl={
<RefreshControl
refreshing={refreshing}
onRefresh={onRefresh}
/>
}
>

<ImageBackground
source={{
uri: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2"
}}
style={styles.hero}
>

<View style={styles.overlay}>

<Text style={styles.smallText}>
Welcome to
</Text>

<Text style={styles.estate}>
Mzinyathi Gardens
</Text>

<Text style={styles.subtitle}>
The cradle of ubuntu lokubambana
</Text>

<View style={styles.badge}>
<MaterialIcons
name="verified-user"
size={18}
color="#fff"
/>

<Text style={styles.badgeText}>
Security: {securityName}
</Text>
</View>

</View>

</ImageBackground>

<View style={styles.content}>

<View style={styles.statsRow}>

<StatCard
icon="people"
color="#4DA6FF"
value={totalToday}
label="Visitors Today"
/>

<StatCard
icon="location-on"
color="#FDBA2D"
value={mostVisitedSite}
label="Most Visited"
/>

<StatCard
icon="repeat"
color="#32D583"
value={returningCount}
label="Returning"
/>

</View>

<View style={styles.actionRow}>

<ActionCard
title="Register"
icon="person-add"
colors={["#4F8EF7", "#5DAEFF"]}
onPress={() =>
navigation.navigate("RegisterVisitor")
}
/>

<ActionCard
title="Visitors"
icon="list"
colors={["#7C3AED", "#A855F7"]}
onPress={() =>
navigation.navigate("AllVisitors")
}
/>

<ActionCard
title="Returning"
icon="history"
colors={["#0FB9B1", "#2DD4BF"]}
onPress={() =>
navigation.navigate("ReturningVisitors")
}
/>

</View>

<TouchableOpacity
onPress={() =>
navigation.navigate(
"OccurrenceBook", { user }
)
}
>

<LinearGradient
colors={["#1E293B", "#0F172A"]}
style={styles.ob}
>

<MaterialIcons
name="book"
size={28}
color="#B983FF"
/>

<View>

<Text style={styles.obTitle}>
OB
</Text>

<Text style={styles.obSub}>
Occurrence Book
</Text>

</View>

</LinearGradient>

</TouchableOpacity>

<Text style={styles.section}>
Recent Visitors
</Text>

<View style={styles.recentBox}>

{recentVisitors.map((v) => (

<View
key={v._id}
style={styles.visitorRow}
>

<View style={styles.avatar}>
<Text style={styles.avatarTxt}>
{v.firstName?.charAt(0)}
</Text>
</View>

<View style={{ flex: 1 }}>
<Text style={styles.name}>
{v.firstName} {v.surname}
</Text>

<Text style={styles.details}>
{v.site}
</Text>
</View>

<View style={styles.status}>
<Text style={styles.statusTxt}>
Checked In
</Text>
</View>

</View>

))}

</View>

</View>

</ScrollView>
);
}

function StatCard({
icon,
value,
label,
color,
}) {
return (

<View style={styles.card}>

<MaterialIcons
name={icon}
size={28}
color={color}
/>

<Text style={styles.cardValue}>
{value}
</Text>

<Text style={styles.cardLabel}>
{label}
</Text>

</View>

);
}

function ActionCard({
title,
icon,
colors,
onPress,
}) {
return (

<TouchableOpacity
style={{ flex: 1 }}
onPress={onPress}
>

<LinearGradient
colors={colors}
style={styles.actionCard}
>

<MaterialIcons
name={icon}
size={30}
color="#fff"
/>

<Text style={styles.actionText}>
{title}
</Text>

</LinearGradient>

</TouchableOpacity>

);
}

const styles = StyleSheet.create({

container: {
flex: 1,
backgroundColor: "#EEF2F7",
},

hero: {
height: 320,
},

overlay: {
flex: 1,
padding: 30,
justifyContent: "center",
backgroundColor: "rgba(0,0,0,0.45)",
},

smallText: {
color: "#ddd",
fontSize: 18,
},

estate: {
fontSize: 42,
fontWeight: "bold",
color: "#fff",
},

subtitle: {
fontSize: 18,
color: "#ddd",
marginTop: 10,
},

badge: {
marginTop: 20,
backgroundColor: "rgba(255,255,255,0.15)",
padding: 12,
borderRadius: 40,
flexDirection: "row",
alignItems: "center",
alignSelf: "flex-start",
},

badgeText: {
color: "#fff",
marginLeft: 10,
},

content: {
marginTop: -40,
padding: 20,
borderTopLeftRadius: 35,
borderTopRightRadius: 35,
backgroundColor: "#F7F9FC",
},

statsRow: {
flexDirection: "row",
justifyContent: "space-between",
},

card: {
backgroundColor: "#fff",
width: "31%",
padding: 18,
borderRadius: 24,
alignItems: "center",
elevation: 5,
},

cardValue: {
fontSize: 24,
fontWeight: "bold",
marginTop: 10,
},

cardLabel: {
textAlign: "center",
color: "#667085",
},

section: {
fontSize: 24,
fontWeight: "700",
marginVertical: 25,
},

recentBox: {
backgroundColor: "#fff",
borderRadius: 25,
padding: 15,
},

visitorRow: {
flexDirection: "row",
alignItems: "center",
marginBottom: 15,
},

avatar: {
width: 50,
height: 50,
borderRadius: 25,
backgroundColor: "#E9D5FF",
justifyContent: "center",
alignItems: "center",
marginRight: 12,
},

avatarTxt: {
fontWeight: "bold",
},

name: {
fontWeight: "700",
fontSize: 16,
},

details: {
color: "#777",
},

status: {
backgroundColor: "#D1FAE5",
paddingHorizontal: 12,
paddingVertical: 6,
borderRadius: 20,
},

statusTxt: {
color: "#059669",
},

actionRow: {
flexDirection: "row",
gap: 10,
marginVertical: 25,
},

actionCard: {
padding: 22,
borderRadius: 25,
alignItems: "center",
},

actionText: {
marginTop: 10,
fontWeight: "bold",
color: "#fff",
},

ob: {
padding: 25,
borderRadius: 28,
flexDirection: "row",
alignItems: "center",
gap: 20,
},

obTitle: {
fontSize: 26,
fontWeight: "bold",
color: "#fff",
},

obSub: {
color: "#aaa",
},

});