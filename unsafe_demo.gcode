; --- IndustriLease Unsafe Demo G-Code ---
; This file contains intentional safety envelope violations:
; - Extruder Temp (290°C) exceeds safety limit (275°C)
; - Bed Temp (125°C) exceeds safety limit (110°C)
; - Feedrate (6000 mm/min) exceeds safety limit (5000 mm/min)
; - X coordinate (240mm) exceeds build boundary (220mm)

M140 S125            ; VIOLATION: Bed Temp (125°C) is too high!
M104 S290            ; VIOLATION: Extruder Temp (290°C) is too high!
M190 S125            ; Wait for Bed to heat
M109 S290            ; Wait for Extruder to heat

G28                  ; Home axes
G90                  ; Absolute positioning
G1 F6000 Z10.0       ; VIOLATION: Feedrate (6000 mm/min) is too fast!

G1 F3000 X240 Y50    ; VIOLATION: X coordinate (240mm) exceeds build size limit (220mm)!
G1 X150 Y150         ; Normal move
G1 X50 Y150          ; Normal move

M104 S0              ; Turn off hotend
M140 S0              ; Turn off bed
M84                  ; Disable motors
