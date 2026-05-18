"""
BTRC IMS — Master Data Inventory (single sheet)
Merges: Received Files + Data Types + Date Received + Usage status + Notes
No implementation gap counts.
"""

import pathlib
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

OUT = pathlib.Path(r"C:\Users\ASUS\Downloads\BTRC-IMS-RFP-Submission-master\BTRC-IMS-RFP-Submission-master\Demo-UI\MapData\BTRC_Master_Data_Inventory.xlsx")

wb = Workbook()

# ── Palette ──────────────────────────────────────────────────────────
P = dict(
    navy="1E3A5F", blue="2563EB", blue_lt="EFF6FF", blue_acc="BFDBFE",
    green="166534", green_lt="F0FDF4", green_acc="BBF7D0",
    amber="92400E", amber_lt="FFFBEB", amber_acc="FDE68A",
    red="991B1B",  red_lt="FEF2F2",  red_acc="FECACA",
    purple="5B21B6", purple_lt="F5F3FF", purple_acc="DDD6FE",
    slate="334155", slate_lt="F8FAFC", slate_acc="E2E8F0",
    white="FFFFFF", gray="94A3B8", border="CBD5E1",
)

def sd(c=P["border"], s="thin"): return Side(border_style=s, color=c)
THIN = Border(left=sd(), right=sd(), top=sd(), bottom=sd())
MED  = Border(left=sd(P["navy"], "medium"), right=sd(P["navy"], "medium"),
              top=sd(P["navy"], "medium"),  bottom=sd(P["navy"], "medium"))

def fill(h):  return PatternFill("solid", fgColor=h)

def wcell(c, val, bold=False, sz=9, fg="000000", bg=None,
          align="left", wrap=True, italic=False, border=THIN):
    c.value = val
    c.font  = Font(name="Calibri", bold=bold, size=sz, color=fg, italic=italic)
    if bg: c.fill = fill(bg)
    c.alignment = Alignment(horizontal=align, vertical="top", wrap_text=wrap)
    c.border = border

def title_row(ws, row, text, ncols, bg=P["navy"], fg=P["white"], sz=13, h=28):
    ws.merge_cells(f"A{row}:{get_column_letter(ncols)}{row}")
    c = ws.cell(row=row, column=1)
    wcell(c, text, bold=True, sz=sz, fg=fg, bg=bg, align="center", border=MED)
    ws.row_dimensions[row].height = h

def sub_row(ws, row, text, ncols, bg=P["blue"], fg=P["white"], sz=10, h=16):
    ws.merge_cells(f"A{row}:{get_column_letter(ncols)}{row}")
    c = ws.cell(row=row, column=1)
    wcell(c, text, bold=False, sz=sz, fg=fg, bg=bg, align="center",
          italic=True, border=MED)
    ws.row_dimensions[row].height = h

def grp_row(ws, row, text, ncols, h=15):
    ws.merge_cells(f"A{row}:{get_column_letter(ncols)}{row}")
    c = ws.cell(row=row, column=1)
    wcell(c, text, bold=True, sz=10, fg=P["navy"], bg=P["blue_acc"],
          align="left", border=THIN)
    ws.row_dimensions[row].height = h

def hdr_row(ws, row, cols, h=32):
    for ci, (label, _) in enumerate(cols, 1):
        c = ws.cell(row=row, column=ci)
        wcell(c, label, bold=True, sz=10, fg=P["white"], bg=P["blue"],
              align="center", border=THIN)
    ws.row_dimensions[row].height = h

def set_widths(ws, cols):
    for ci, (_, w) in enumerate(cols, 1):
        ws.column_dimensions[get_column_letter(ci)].width = w

# ════════════════════════════════════════════════════════════════════
# MASTER SHEET
# ════════════════════════════════════════════════════════════════════
ws = wb.active
ws.title = "Master Data Inventory"

COLS = [
    ("S/N",                   4),
    ("Operator / Source",    22),
    ("Dataset",              22),
    ("Primary File(s)",      40),
    ("Format",               13),
    ("Date Received",        14),
    ("Records / Features",   14),
    ("Geometry",             10),
    ("Sub-types / Categories", 38),
    ("Key Attributes",       36),
    ("Coord System",         12),
    ("Data Period",          11),
    ("Used on Map?",         12),
    ("Notes / Remarks",      42),
]
NC = len(COLS)

title_row(ws, 1,
    "BTRC IMS — Master Data Inventory  |  Submitted to BTRC for Validation",
    NC)
sub_row(ws, 2,
    "One row per dataset. Combines: received file details, data type analysis, usage status, and remarks.",
    NC)
ws.row_dimensions[3].height = 4
hdr_row(ws, 4, COLS)
set_widths(ws, COLS)
ws.freeze_panes = "A5"

# ── Usage colour map ────────────────────────────────────────────────
USED_MAP = {
    "Yes":      (P["green_lt"],  P["green"]),
    "Partial":  (P["amber_lt"],  P["amber"]),
    "No":       (P["red_lt"],    P["red"]),
    "Indirect": (P["purple_lt"], P["purple"]),
}

# ── Master data rows ─────────────────────────────────────────────────
# Fields per row:
#   operator, dataset, primary_file, fmt, date_received,
#   records, geometry, subtypes, key_attrs, crs, period, used, notes
ROWS = [

    # ── Grameenphone ────────────────────────────────────────────────
    ("Grameenphone (GP)",
     "BTS Sites",
     "GP_Tx Information_18-Dec-25.xlsx",
     "XLSX", "18 Dec 2025",
     "23,864", "Point",
     "Fiber Connected: 8,971\nMW (Microwave): 14,893",
     "Site Code, Latitude, Longitude, TX Type (Fiber / MW)",
     "WGS84", "Dec 2025", "Yes",
     "All sites on map. Admin (Division / District / Upazila) enriched via"
     " point-in-polygon lookup. 246 border-edge sites show '—' for admin."),

    # ── Robi Axiata ──────────────────────────────────────────────────
    ("Robi Axiata",
     "BTS Sites",
     "Robi site list_Nov'25_BTRC_MW & fiber.xlsx",
     "XLSX", "Nov 2025",
     "18,838", "Point",
     "MW Only: 13,760\nFiber Only: 1,632\nMW + Fiber (Both): 3,446",
     "Site Code, Latitude, Longitude, MW flag (Yes / –), Fiber flag (Yes / –)",
     "WGS84", "Nov 2025", "Yes",
     "All sites on map. Three-category backhaul classification applied."
     " Admin enriched via PIP. 169 border-edge sites show '—'."),

    # ── Banglalink ───────────────────────────────────────────────────
    ("Banglalink",
     "BTS Sites — Latest",
     "BTS Information_Banglalink_Till 15 Dec 25.xlsx",
     "XLSX", "Dec 2025",
     "15,154", "Point",
     "Microwave: 13,015\nFiber: 2,113\nInactive: 26",
     "Unique Site ID, Lat, Lon, Division, District, Thana, Address,"
     " MW Link Status, Fiber Optic Status, Primary Backhaul Type",
     "WGS84", "Dec 2025", "Yes",
     "All sites on map. Admin data taken directly from Excel (no PIP needed)."
     " Address field included in popup."),

    ("Banglalink",
     "BTS Towers — Historical",
     "3gtower.geojson",
     "GeoJSON", "Pre-2025",
     "13,208", "Point",
     "4G sites\n3G only\n2G only",
     "Site Code, Site Name, Generation (2G/3G/4G), Division, District,"
     " Upazila, Union, Vendor",
     "WGS84", "Pre-2025", "Yes",
     "Historical tower dataset. Filterable by generation on map."),

    ("Banglalink",
     "Fiber Lines — Historical",
     "bl-line.geojson",
     "GeoJSON", "Pre-2025",
     "172", "LineString",
     "72 Core\n48 Core\n32 Core",
     "Core Count",
     "WGS84", "Pre-2025", "Yes",
     "Historical fiber route lines. Filterable by core count on map."),

    # ── BTCL ─────────────────────────────────────────────────────────
    ("BTCL",
     "Network Points — Latest",
     "GEO SPIRAL DATA STRUCTURE_TEMPLE_FINAL_BTCL.xlsx",
     "XLSX", "2025",
     "24,142", "Point",
     "CP (Connection Point)\nHH (Hand Hole)\nHOP\nPOP\nMH (Man Hole)\nOther"
     "\n(3,432 raw type values normalised to 6 categories)",
     "Name, Latitude, Longitude, Point Type, Raw Type, Year, Feature Code",
     "WGS84", "2025", "Yes",
     "24,073 on map (69 removed by PIP — coordinates outside Bangladesh boundary;"
     " likely data-entry errors near borders)."),

    ("BTCL",
     "Fiber Lines — Historical",
     "btcl-nttn-line.geojson",
     "GeoJSON", "Pre-2025",
     "584", "MultiLineString",
     "144+ Core\n96 Core\n48 Core\n24 Core\n<24 Core",
     "Operator Name, Line Name, Line Type, Core Count, Route Length (km),"
     " Cable Length (km), Duct Info, Division / District / Upazila",
     "WGS84", "Pre-2025", "Yes",
     "All lines on map. Filterable by core-count band."),

    ("BTCL",
     "Network Nodes — Historical",
     "btcl-ponts.geojson",
     "GeoJSON", "Pre-2025",
     "29,795", "Point",
     "HOP\nHH (Hand Hole)\nCP (Connection Point)\nMH (Man Hole)",
     "Operator Name, Point Name, Point Type, Lat, Lon,"
     " Division, District, Upazila, Union, Mouza, Year",
     "WGS84", "Pre-2025", "Yes",
     "All nodes on map. Filterable by node type."),

    ("BTCL",
     "Union Project Locations",
     "btcl-union-project-location.geojson",
     "GeoJSON", "Pre-2025",
     "966", "Point",
     "Union-level project markers",
     "Location coordinates",
     "WGS84", "Pre-2025", "Yes",
     "All union project markers on map."),

    # ── Fiber@Home FHLFON ─────────────────────────────────────────────
    ("Fiber@Home (FHLFON)",
     "Fiber Lines",
     "FHLFONLine.shp + FHLFONLineExcel.xlsx\n(9 files: 8 shapefile components + 1 Excel)",
     "Shapefile + XLSX", "Dec 2024",
     "141,567", "LineString",
     "Aerial: 85,366\nBurial: 53,870\nOPGW: 2,331",
     "Operator Code, Operator Name, Infra Type (Own / Leased), Line ID,"
     " Year, Month, Line Name, Line Type, Path Along, Duct No, Duct Use, Cable No",
     "WGS84", "Dec 2024", "Partial",
     "Only 18,405 of 141,567 lines currently on map (13%). Full re-ingestion"
     " from FHLFONLineExcel.xlsx needed. OPGW lines (2,331) also not yet shown."),

    ("Fiber@Home (FHLFON)",
     "Network Points",
     "FHLFONPoint.shp + FHLFONPointExcel.xlsx\n(10 files: 8 shapefile + 1 Excel + 1 duplicate)",
     "Shapefile + XLSX", "Dec 2024",
     "122,150", "Point",
     "JE (Joint Enclosure): 38,097\nEP (End Point): 25,804\nCoupler: 22,435"
     "\nFL (Fiber Loop): 16,558\nHH (Hand Hole): 8,292\nBTS: 4,755"
     "\nCO (Central Office): 2,087\nFAT: 1,591\nBDB: 1,390\nPole: 479"
     "\nLDP: 387\nFDH: 80\nPIT: 26\nCustomer: 25\nOther / Noise: ~44",
     "Year, Month, Operator Code, Operator Name, Point ID, Point Type,"
     " Point Name, Address, Latitude, Longitude, Feature Code",
     "WGS84", "Dec 2024", "Partial",
     "94,953 of 122,150 on map (78%). Missing types: Coupler (22,435),"
     " FL (16,558), BDB (1,390), Pole (479), LDP (387), PIT (26), Customer (25)."
     " Note: 'Copy of FHLFONPointExcel.xlsx' is an exact duplicate — not used."),

    # ── Summit Communications ─────────────────────────────────────────
    ("Summit Communications",
     "Fiber Lines",
     "Line_data.xlsx + Line_data.shp\n(1 Excel + multiple shapefile components)",
     "XLSX + Shapefile", "Mar 2026",
     "102,514", "LineString",
     "Aerial: 78,499\nBurial: 22,702\nOverhead PGCB: 1,209"
     "\nBridge Crossing: 14\nBurial (Damaged): 89",
     "FID, Line ID, Year, Month, Operator Code, Operator Name, Infra Type,"
     " Line Type, Line Name, Path Along, No of Ducts, Duct Use",
     "WGS84", "Mar 2026", "Partial",
     "Only 23,157 of 102,514 lines on map (23%). Full re-ingestion from"
     " Line_data.xlsx needed. Missing ~79,357 lines (mostly Aerial and Burial)."),

    ("Summit Communications",
     "Network Points",
     "Point_data.xlsx + Point_data.shp\n(1 Excel + multiple shapefile components)",
     "XLSX + Shapefile", "Mar 2026",
     "68,850", "Point",
     "TJB (Joint Box): 37,909\nHH (Hand Hole): 9,506\nBTS: 8,613"
     "\nEP (End Point): 6,872\nNode / Info: 1,539\nODB: 1,193\nNode / TT: 812"
     "\nPOP: 666\nPOC: 453\nBS (Base Station): 422\nNode / CBD: 245"
     "\nCOLO / PoP: 128\nFAT: 89\nFDT: 62\nOther: ~183",
     "FID, Point ID, Year, Month, Operator Code, Operator Name,"
     " Point Type, Point Name, Latitude, Longitude, Feature Code",
     "WGS84", "Mar 2026", "Partial",
     "14,562 of 68,850 on map (21%). Missing: TJB (37,909), EP (6,872),"
     " ODB (1,193), Node/TT (812), POP (666), POC (453), BS (422),"
     " Node/CBD (245), COLO/PoP (128), FAT (89), FDT (62) and others."),

    ("Summit Communications",
     "Summit.rar (Archive — not extracted)",
     "Summit.rar",
     "RAR Archive", "Not specified",
     "Unknown", "Unknown",
     "Unknown — archive not extracted",
     "Unknown",
     "Unknown", "Unknown", "No",
     "Archive file in Railway folder. Contents not yet extracted or analysed."
     " May contain additional network data."),

    # ── Bahon Limited ─────────────────────────────────────────────────
    ("Bahon Limited",
     "Fiber Lines",
     "Bahon Network_System Line.shp\n(+ .dbf, .shx, .sbn, .sbx, .cpg, .prj, .qmd)",
     "Shapefile", "Pre-2025",
     "~7,763", "LineString",
     "Overhead (OH)\nUnderground (UG)\nWall Clamped (WC)",
     "Cable Type, Division, District, Upazila (from DBF attributes)",
     "WGS84", "Pre-2025", "Yes",
     "All lines on map. Shapefile only — no Excel counterpart received."
     " Exact record count unverified from DBF."),

    ("Bahon Limited",
     "Network Nodes",
     "(Derived from shapefile dataset)",
     "Shapefile", "Pre-2025",
     "12,817", "Point",
     "Network junction nodes",
     "Node coordinates",
     "WGS84", "Pre-2025", "Yes",
     "All nodes on map."),

    # ── InfoSarkar-3 ──────────────────────────────────────────────────
    ("InfoSarkar-3 (IS3)",
     "Fiber Lines",
     "doc.kml\n(icon assets: mysavedplaces_closed.png, mysavedplaces_open.png)",
     "KML", "Pre-2025",
     "3,383", "LineString",
     "48 Core\n24 Core\n12 Core\nMessenger\nRing\nCBD",
     "Core count, Name, Layer, Length (km)",
     "WGS84", "Pre-2025", "Yes",
     "All lines on map with core-count filter."),

    ("InfoSarkar-3 (IS3)",
     "Network Nodes",
     "doc.kml (same file)",
     "KML", "Pre-2025",
     "477", "Point",
     "Network junction nodes",
     "Node coordinates",
     "WGS84", "Pre-2025", "Yes",
     "All nodes on map."),

    # ── PGCB ──────────────────────────────────────────────────────────
    ("PGCB",
     "OPGW Transmission Lines",
     "Power Grid Tranmission(OPGW).kml",
     "KML", "Pre-2025",
     "324", "LineString",
     "400 kV Transmission Line\n230 kV Transmission Line"
     "\n132 kV Transmission Line\nUnderground Cable\nOthers",
     "Layer (voltage / type), Name, Description",
     "WGS84", "Pre-2025", "Yes",
     "All OPGW lines on map. Filterable by voltage / line type."),

    # ── Multi-operator Fiber Network ──────────────────────────────────
    ("Multi-operator\n(GP, Robi, BTCL, BL, MOTN, BSCCL)",
     "Fiber Network — Lines",
     "fiber_network_multiple_district.kmz",
     "KMZ", "2025",
     "8,163", "LineString",
     "By operator: Grameenphone, Robi, BTCL,"
     "\nBanglalink, MOTN, BSCCL, Unknown",
     "Name, Operator, Distance (km)",
     "WGS84", "2025", "Yes",
     "All 6-operator inter-district fiber lines on map. Operator colour filter applied."),

    ("Multi-operator\n(GP, Robi, BTCL, BL, MOTN, BSCCL)",
     "Fiber Network — Points",
     "fiber_network_multiple_district.kmz (same file)",
     "KMZ", "2025",
     "19,096", "Point",
     "By operator: Grameenphone, Robi, BTCL,"
     "\nBanglalink, MOTN, BSCCL, Unknown",
     "Name, Operator",
     "WGS84", "2025", "Yes",
     "All 6-operator fiber junction points on map."),

    # ── Bangladesh Railway ────────────────────────────────────────────
    ("Bangladesh Railway (BR)",
     "Fiber Lines along Railway",
     "Geo Spatial Data Structure_Template_Final_railway.xlsx",
     "XLSX", "2025",
     "353", "LineString",
     "8 Core\n16 Core\n32 Core\n48 Core\n72 Core\n96 Core",
     "Station Name A, Station Name B, Length (km),"
     " Total Core, Used Core, Unused Core",
     "WGS84", "2025", "Yes",
     "All 353 fiber route segments on map. Note: duplicate copy of same"
     " file exists in Railway folder — not used."),

    ("Bangladesh Railway (BR)",
     "Fiber Station Nodes",
     "(Derived from railway Excel)",
     "XLSX", "2025",
     "354", "Point",
     "Station junction nodes",
     "Station name",
     "WGS84", "2025", "Yes",
     "All 354 station nodes on map."),

    ("Bangladesh Railway (BR)",
     "Railway Track (Base Layer)",
     "railway.geojson\n(source: railline_wgs.shp + .dbf + .shx + .prj + .cst)",
     "GeoJSON + Shapefile", "Pre-2025",
     "2,675", "LineString",
     "Railway route segments",
     "Route geometry",
     "WGS84", "Pre-2025", "Yes",
     "Base railway track layer on map."),

    # ── ISP POP ───────────────────────────────────────────────────────
    ("All ISPs (Multi-operator)",
     "ISP POP Locations",
     "aisp-pop.geojson  /  all-isp-pop-info.json\n(same data in two formats)",
     "GeoJSON + JSON", "2020–2021",
     "3,930", "Point",
     "Category-A ISPs\nCategory-B ISPs\nCategory-C ISPs"
     "\n(covers all districts nationwide)",
     "GID, POP Code, POP Name, POP Address, POP Capacity, ISP Name,"
     " Type of ISP, Lat, Lon, District, Division, Upazila, Union, Mouza",
     "WGS84", "2020–2021", "No",
     "Data available and ready. Not yet implemented on map."
     " Priority: High — add ISP POP overlay with category filter."),
]

# ── Render rows ──────────────────────────────────────────────────────
row  = 5
alt  = False
prev = None
sn   = 0

for (op, dataset, pfile, fmt, date_recv,
     records, geom, subtypes, attrs, crs, period, used, notes) in ROWS:

    # Operator group header
    if op != prev:
        grp_row(ws, row, f"  {op}", NC)
        row += 1
        prev = op
        alt  = False

    sn += 1
    used_key = used.split(" ")[0]
    bg_used, fg_used = USED_MAP.get(used_key, (P["white"], P["slate"]))
    row_bg = P["slate_lt"] if alt else P["white"]

    vals = [sn, op, dataset, pfile, fmt, date_recv,
            records, geom, subtypes, attrs, crs, period, used, notes]

    for ci, val in enumerate(vals, 1):
        c = ws.cell(row=row, column=ci)
        if ci == 13:   # Used on Map — colour-coded
            wcell(c, val, bold=True, sz=9, fg=fg_used, bg=bg_used, align="center")
        elif ci == 1:  # S/N — centred
            wcell(c, val, bold=True, sz=9, bg=row_bg, align="center")
        elif ci == 2:  # Operator — bold
            wcell(c, val, bold=True, sz=9, bg=row_bg)
        else:
            wcell(c, val, sz=9, bg=row_bg)

    ws.row_dimensions[row].height = 72
    alt = not alt
    row += 1

# ── Legend ───────────────────────────────────────────────────────────
row += 1
for label, (bg, fg) in [
    ("Yes — fully implemented on the map",            (P["green_lt"],  P["green"])),
    ("Partial — only a subset is on the map",         (P["amber_lt"],  P["amber"])),
    ("No — data not yet implemented on the map",      (P["red_lt"],    P["red"])),
    ("Indirect — used as a source for another file",  (P["purple_lt"], P["purple"])),
]:
    ws.merge_cells(f"A{row}:{get_column_letter(NC)}{row}")
    c = ws.cell(row=row, column=1)
    wcell(c, f"  ■  {label}", bold=True, sz=9, fg=fg, bg=bg, border=THIN)
    ws.row_dimensions[row].height = 14
    row += 1

# ── Sheet settings ───────────────────────────────────────────────────
ws.auto_filter.ref = f"A4:{get_column_letter(NC)}4"
ws.page_setup.orientation = "landscape"
ws.page_setup.fitToPage   = True
ws.page_setup.fitToWidth  = 1
ws.page_setup.fitToHeight = 0
ws.print_title_rows       = "1:4"
ws.sheet_view.showGridLines = True

wb.save(str(OUT))
print(f"Saved -> {OUT}")
print(f"Rows  : {sn} datasets across all operators")
