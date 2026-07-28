import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * LeafletMap - A generic OpenStreetMap component using Leaflet via WebView
 * 
 * @param {Array} markers - Array of objects: { coordinate: { latitude, longitude }, icon: 'bus'|'home'|'driver', title: '...' }
 * @param {number|null} showDistance - Distance in km to display as a label on the polyline (optional)
 */
const LeafletMap = ({ markers = [], showDistance = null }) => {
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
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    font-size: 18px;
                }
                .icon-bus { background-color: #10b981; width: 36px; height: 36px; }
                .icon-home { background-color: #3b82f6; width: 36px; height: 36px; }
                .icon-driver { background-color: #10b981; width: 36px; height: 36px; }
                .distance-label {
                    background: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #1f2937;
                    border: 2px solid #0284c7;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    white-space: nowrap;
                }
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
                    window.distanceMarker = null;

                    function createIcon(type) {
                        var className = 'custom-icon icon-' + (type || 'bus');
                        var emoji = '📍';
                        if (type === 'bus' || type === 'driver') emoji = '🚌';
                        if (type === 'home') emoji = '🏠';

                        return L.divIcon({
                            className: 'custom-div-icon',
                            html: "<div class='" + className + "'>" + emoji + "</div>",
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        });
                    }

                    function formatDistance(distanceKm) {
                        if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return null;
                        if (distanceKm < 1) {
                            return Math.round(distanceKm * 1000) + ' m';
                        }
                        return distanceKm.toFixed(1) + ' km';
                    }

                    function updateMap(markersData, distanceKm) {
                        try {
                            markersLayer.clearLayers();
                            if (window.routeLine) {
                                map.removeLayer(window.routeLine);
                                window.routeLine = null;
                            }
                            if (window.distanceMarker) {
                                map.removeLayer(window.distanceMarker);
                                window.distanceMarker = null;
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
                                    
                                    if (m.title) {
                                        marker.bindTooltip(m.title, { permanent: false, direction: 'top' });
                                    }
                                    
                                    bounds.extend(marker.getLatLng());
                                    validMarkerCoords.push([lat, lng]);

                                    if (m.icon === 'home') parentCoord = [lat, lng];
                                    if (m.icon === 'bus' || m.icon === 'driver') busCoord = [lat, lng];
                                }
                            });

                            // Draw polyline between parent and bus
                            if (parentCoord && busCoord) {
                                window.routeLine = L.polyline([parentCoord, busCoord], {
                                    color: '#0284c7',
                                    weight: 5,
                                    opacity: 0.9,
                                    dashArray: null,
                                    lineCap: 'round',
                                    lineJoin: 'round'
                                }).addTo(map);

                                // Add distance label at midpoint
                                var midLat = (parentCoord[0] + busCoord[0]) / 2;
                                var midLng = (parentCoord[1] + busCoord[1]) / 2;
                                
                                var distText = formatDistance(distanceKm) || '';
                                if (distText) {
                                    window.distanceMarker = L.marker([midLat, midLng], {
                                        icon: L.divIcon({
                                            className: 'distance-label-container',
                                            html: '<div class="distance-label">' + distText + '</div>',
                                            iconSize: [0, 0],
                                            iconAnchor: [0, 0]
                                        }),
                                        interactive: false,
                                        zIndexOffset: 1000
                                    }).addTo(map);
                                }

                                if (window.routeLine.getBounds().isValid()) {
                                    map.fitBounds(window.routeLine.getBounds(), {
                                        padding: [60, 60],
                                        maxZoom: 16
                                    });
                                }
                            } 
                            // Fit to all markers if no polyline possible
                            else if (validMarkerCoords.length > 1 && bounds.isValid()) {
                                map.fitBounds(bounds, {
                                    padding: [50, 50],
                                    maxZoom: 16
                                });
                            } 
                            // Single marker - center on it
                            else if (validMarkerCoords.length === 1) {
                                map.setView(validMarkerCoords[0], 16);
                            }
                        } catch (err) {
                            console.error("Leaflet update error:", err);
                        }
                    }

                    // Listen for messages from React Native
                    window.addEventListener('message', function(event) {
                        try {
                            var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                            if (data) {
                                var mkrs = data.markers || [];
                                var dist = data.distance !== undefined ? data.distance : null;
                                updateMap(mkrs, dist);
                            }
                        } catch (e) {
                            console.error("Leaflet message parse error:", e);
                        }
                    });

                    // Initial render
                    updateMap([], null);
                } catch (initErr) {
                    console.error("Leaflet map init error:", initErr);
                }
            </script>
        </body>
        </html>
    `;

    // Inject markers + distance into webview whenever props change
    useEffect(() => {
        if (webViewRef.current) {
            try {
                const safeMarkers = (markers || []).filter(m =>
                    m && m.coordinate &&
                    !isNaN(Number(m.coordinate.latitude !== undefined ? m.coordinate.latitude : m.coordinate.lat)) &&
                    !isNaN(Number(m.coordinate.longitude !== undefined ? m.coordinate.longitude : m.coordinate.lng)) &&
                    isFinite(Number(m.coordinate.latitude !== undefined ? m.coordinate.latitude : m.coordinate.lat)) &&
                    isFinite(Number(m.coordinate.longitude !== undefined ? m.coordinate.longitude : m.coordinate.lng))
                );
                const payload = JSON.stringify({
                    markers: safeMarkers,
                    distance: showDistance
                });
                const script = `try { updateMap(${payload}.markers, ${payload}.distance); } catch(e) { console.error(e); } true;`;
                webViewRef.current.injectJavaScript(script);
            } catch (err) {
                console.error('WebView injection error:', err);
            }
        }
    }, [markers, showDistance]);

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
                    // Bridge message handling (can be extended)
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

