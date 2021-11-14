# toddlersynth

A raspberry pi project for making a toy synth using puredata and nodejs

music stuff happens in pd.

interfacing with the pi happens in node.

soundfiles in pd/tracks/*.wav can easily be switched out.

## find rpi on network
nmap -sP 192.168.1.0/24

## resources for generating wav tracks
https://soundation.com/
https://online-audio-converter.com/ (ability to resample to 44100 used in pd)

## copy tracks to pi
scp -r pd/tracks pi@192.168.1.130:/home/pi/toddlersynth/pd

## test audio
pd -nogui pd/test.pd 
https://forums.raspberrypi.com/viewtopic.php?t=84128