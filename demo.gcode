; --- IndustriLease Safe Demo G-Code ---
; This file complies with all machine safety boundaries:
; Extruder Temp <= 275°C, Bed Temp <= 110°C, Feedrate <= 5000, X/Y <= 220, Z <= 250

M140 S60             ; Set Bed Temperature to 60°C (Safe limit: 110°C)
M104 S210            ; Set Extruder Temperature to 210°C (Safe limit: 275°C)
M190 S60             ; Wait for Bed to heat up
M109 S210            ; Wait for Extruder to heat up

G28                  ; Home all axes
G90                  ; Absolute positioning
G1 F1200 Z10.0       ; Move Z to 10mm height at 1200 mm/min

G1 F3000 X50 Y50     ; Rapid move to start coordinate (50, 50) within [0, 220] boundaries
G1 F1500 X150 Y50    ; Print line 1
G1 X150 Y150         ; Print line 2
G1 X50 Y150          ; Print line 3
G1 X50 Y50           ; Close square loop

M104 S0              ; Turn off hotend
M140 S0              ; Turn off bed
M84                  ; Disable motors
