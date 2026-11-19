#!/bin/bash
# Startet Burg Funkelstein auf diesem Mac und öffnet sie im Browser.
# Auf dem iPad (gleiches WLAN) dann im Safari öffnen:  http://<Name-des-Macs>.local:8140
cd "$(dirname "$0")"
PORT=8140
if ! lsof -i tcp:$PORT >/dev/null 2>&1; then
  python3 tools/serve.py $PORT >/dev/null 2>&1 &
  sleep 1
fi
open "http://localhost:$PORT"
echo "Burg Funkelstein läuft auf http://localhost:$PORT"
echo "iPad im gleichen WLAN:  http://$(scutil --get LocalHostName).local:$PORT"
echo "Dieses Fenster offen lassen, solange gespielt wird."
wait
