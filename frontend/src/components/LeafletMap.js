import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * LeafletMap - A generic OpenStreetMap component using Leaflet via WebView
 * 
 * @param {Array} markers - Array of objects: { coordinate: { latitude, longitude }, icon: 'bus'|'home'|'driver', title: '...' }
 */
const LeafletMap = ({ markers = [] }) => {
    const webViewRef = useRef(null);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; background-color: #f3f4f6; }
                #map { width: 100vw; height: 100vh; }
                .custom-icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    font-size: 16px;
                }
                .icon-bus { background-color: #10b981; }
                .icon-home { background-color: #3b82f6; }
                .icon-driver { background-color: #10b981; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                try {
                    var map = L.map('map', {
                        zoomControl: false,
                        attributionControl: false
                    }).setView([24.8607, 67.0011], 13);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                    }).addTo(map);

                    var markersLayer = L.layerGroup().addTo(map);
                    window.routeLine = null;

                    function createIcon(type) {
                        var className = 'custom-icon icon-' + (type || 'bus');
                        var emoji = '📍';
                        if (type === 'bus' || type === 'driver') emoji = '🚌';
                        if (type === 'home') emoji = '🏠';

                        return L.divIcon({
                            className: 'custom-div-icon',
                            html: "<div class='" + className + "' style='width:32px; height:32px;'>" + emoji + "</div>",
                            iconSize: [32, 32],
                            iconAnchor: [16, 16]
                        });
                    }

                    function updateMarkers(markersData) {
                        try {
                            markersLayer.clearLayers();
                            if (window.routeLine) {
                                map.removeLayer(window.routeLine);
                                window.routeLine = null;
                            }

                            if (!markersData || !Array.isArray(markersData) || markersData.length === 0) return;

                            var bounds = L.latLngBounds();
                            var validMarkerCoords = [];
                            var parentCoord = null;
                            var busCoord = null;

                            markersData.forEach(function(m) {
                                if (!m || !m.coordinate) return;
                                var lat = Number(m.coordinate.latitude !== undefined ? m.coordinate.latitude : m.coordinate.lat);
                                var lng = Number(m.coordinate.longitude !== undefined ? m.coordinate.longitude : m.coordinate.lng);

                                if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0) {
                                    var marker = L.marker([lat, lng], {
                                        icon: createIcon(m.icon)
                                    }).addTo(markersLayer);
                                    bounds.extend(marker.getLatLng());
                                    validMarkerCoords.push([lat, lng]);

                                    if (m.icon === 'home') parentCoord = [lat, lng];
                                    if (m.icon === 'bus' || m.icon === 'driver') busCoord = [lat, lng];
                                }
                            });

                            // Safe Polyline Execution
                            if (parentCoord && busCoord) {
                                window.routeLine = L.polyline([parentCoord, busCoord], { color: '#0284c7', weight: 4, opacity: 0.8 }).addTo(map);
                                if (window.routeLine.getBounds().isValid()) {
                                    map.fitBounds(window.routeLine.getBounds(), { padding: [50, 50], maxZoom: 16 });
                                }
                            } else if (validMarkerCoords.length > 1 && bounds.isValid()) {
                                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                            } else if (validMarkerCoords.length === 1) {
                                map.setView(validMarkerCoords[0], 16);
                            }
                        } catch (err) {
                            console.error("Leaflet update markers error:", err);
                        }
                    }

                    window.addEventListener('message', function(event) {
                        try {
                            var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                            if (data && data.markers) {
                                updateMarkers(data.markers);
                            }
                        } catch (e) {
                            console.error("Leaflet message parse error:", e);
                        }
                    });

                    updateMarkers([]);
                } catch (initErr) {
                    console.error("Leaflet map init error:", initErr);
                }
            </script>
        </body>
        </html>
    `;

    useEffect(() => {
        if (webViewRef.current) {
            try {
                const safeMarkers = (markers || []).filter(m =>
                    m && m.coordinate &&
                    !isNaN(Number(m.coordinate.latitude !== undefined ? m.coordinate.latitude : m.coordinate.lat)) &&
                    !isNaN(Number(m.coordinate.longitude !== undefined ? m.coordinate.longitude : m.coordinate.lng))
                );
                const script = `try { updateMarkers(${JSON.stringify(safeMarkers)}); } catch(e) { console.error(e); } true;`;
                webViewRef.current.injectJavaScript(script);
            } catch (err) {
                console.error('WebView injection error:', err);
            }
        }
    }, [markers]);

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                scrollEnabled={false}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={(event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data && data.markers && webViewRef.current) {
                            // Bridge message handling
                        }
                    } catch (e) { }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
});

export default LeafletMap;
