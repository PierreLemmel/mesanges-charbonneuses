$wgInterface = "config_wireguard_ordi_pierre_w" 
$oscPortIn = 11000  
$oscPortOut = 11001

Set-NetConnectionProfile -InterfaceAlias $wgInterface -NetworkCategory Private

# OSC -> Ableton -> Chataigne
# New-NetFirewallRule -DisplayName "OSC IN Private" -Direction Inbound -Protocol UDP -LocalPort $oscPortIn -Action Allow -Profile Private
# New-NetFirewallRule -DisplayName "OSC OUT Private" -Direction Outbound -Protocol UDP -LocalPort $oscPortOut -Action Allow -Profile Private

New-NetFirewallRule -DisplayName "WireGuard Private IN" -Direction Inbound -InterfaceAlias $wgInterface -Action Allow -Profile Private
# New-NetFirewallRule -DisplayName "WireGuard Private OUT" -Direction Outbound -InterfaceAlias $wgInterface -Action Allow -Profile Private