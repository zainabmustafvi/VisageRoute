import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * LeafletMap - A generic OpenStreetMap component using Leaflet via WebView
 * 
 * @param {Array} markers - Array of objects: { coordinate: { lat, lng }, icon: 'bus'|'home'|'driver', title: '...' }
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
                /* Custom Icon Styling */
                .custom-icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    font-size: 16px;
                }
                .icon-bus { background-color: #10b981; } /* Emerald */
                .icon-home { background-color: #3b82f6; } /* Blue */
                .icon-driver { background-color: #10b981; } /* Emerald */
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                // Initialize map
                var map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([24.8607, 67.0011], 13);
                
                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                }).addTo(map);

                var markersLayer = L.layerGroup().addTo(map);
                var polylineLayer = L.layerGroup().addTo(map);

                function createIcon(type) {
                    var className = 'custom-icon icon-' + (type || 'bus');
                    var emoji = '📍';
                    if (type === 'bus') emoji = '🚌';
                    if (type === 'driver') emoji = '🚌';
                    if (type === 'home') emoji = '🏠';

                    return L.divIcon({
                        className: 'custom-div-icon',
                        html: "<div class='" + className + "' style='width:32px; height:32px;'>" + emoji + "</div>",
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });
                }

                function updateMarkers(markers) {
                    markersLayer.clearLayers();
                    polylineLayer.clearLayers();
                    var bounds = L.latLngBounds();
                    var latLngs = [];
                    var validMarkers = 0;

                    if (!markers || markers.length === 0) return;

                    markers.forEach(function(m) {
                        if (!m || !m.coordinate) return;
                        var lat = m.coordinate.latitude !== undefined ? m.coordinate.latitude : m.coordinate.lat;
                        var lng = m.coordinate.longitude !== undefined ? m.coordinate.longitude : m.coordinate.lng;

                        if (lat !== undefined && lng !== undefined && lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
                            var marker = L.marker([lat, lng], {
                                icon: createIcon(m.icon)
                            }).addTo(markersLayer);
                            bounds.extend(marker.getLatLng());
                            latLngs.push([lat, lng]);
                            validMarkers++;
                        }
                    });

                    if (latLngs.length >= 2) {
                        L.polyline(latLngs, { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(polylineLayer);
                    }

                    if (validMarkers > 1) {
                        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                    } else if (validMarkers === 1) {
                        map.setView(latLngs[0], 16);
                    }
                }

                // Initial clear
                updateMarkers([]);
            </script>
        </body>
        </html>
    `;

    useEffect(() => {
        if (webViewRef.current) {
            // Safely inject JS to update markers when the props change
            const script = `updateMarkers(${JSON.stringify(markers)});`;
            webViewRef.current.injectJavaScript(script + ' true;');
        }
    }, [markers]);

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <View style={styles.webPlaceholder}>
                    {/* WebView is primarily for mobile. If running on web Expo, it might need iframe mapping. */}
                </View>
            ) : (
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
                    onMessage={(event) => {}}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    webPlaceholder: {
        flex: 1,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default LeafletMap;
