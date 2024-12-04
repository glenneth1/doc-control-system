#import "@preview/cheq:0.1.0": checklist

#show: checklist.with(fill: luma(95%), stroke: blue, radius: .2em)

#show heading: set text(16pt)

#set text(
  font: "calibri",
  size: 11pt
)

#set page(
  paper: "a4",
  margin: (top: 1cm, bottom: 2cm, x: 2.5cm),
  footer: context[
    *VERSAR.COM*
    #h(1fr)
    #counter(page).display(
      "1/1",
      both: true,
    )
  ]
)

#grid(
  columns: (1fr, 1fr, 1fr),
  align: (left, center, right),
//    rect[Left],
    grid.cell(
    colspan: 1,
        image("company_logo.png", width: 70%),
    ),
  [],
    [6850 Versar Center \
    Suite 201 \
    Springfield, VA 22151 \
    *703.642.6830* \
    #link("mailto:info@versar.com") \
    ],
)

#set par(justify: true)
#set heading(numbering: "1.")
\
\
#align(center, text(17pt)[
  *Task Force SAFE Operational Updates 05-DEC-2024*
])
\
\
#grid(
  columns: (1fr, 1fr),
  align(center)[
      Glenn Thompson \
Area of Operations Lead \
      #link("mailto:GThompson@versar.com")
  ],
  align(center)[
    Task Force SAFE \
    Operations Updates \
  ]
)
\
#align(center + top)[
  #image("TFS_Logo.png", width: 50%)
]

#align(center + bottom)[
  #image("Army.png", width: 40%)
]

#pagebreak()

#outline(
    indent: auto,
)

#pagebreak()
#set page(margin: (top: 3.0cm))
= STAFFING
\

Currently have 19 electricians on the program, with 16 on the ground. \

      - This puts us at 89% of the contractual requirement for staffing on the ground.
      - We have seven (7) of the required nine (9) teams per the PWS on the ground, putting us at 78%.
      - The mix ratio of US/UK electricains is currently 78% U.K. and 22% U.S. based on the requirement of eighteen (18) electricians.
 \
= RECRUITMENT
\

- Proving to be difficult with no contract award and the unceertainty of the required number of teams.
\

= TEAM DISTRIBUTION \
\
#show table.cell.where(x: 0): strong
#set align(center)
#table(
  columns: 3,
  gutter: 3pt,
    [LOCATION], [No. OF TEAMS], [COUNTRY],
  [Erbil], [1], [Iraq],
    [JTC/T22], [1], [Jordan],
    [KFAB], [1], [Jordan],
    [ATG], [1], [Syria],
    [Green Village], [1], [Syria],
    [RLZ], [1], [Syria],
    [Shaddadi], [1], [Syria],
)
#set align(left)
 \
= R&R \

== Currently on leave
\

- Matt Kramer currently taking LWOP
- Jeremy Ligon departed Kuwait 26-NOV-2024 and will re3turn 12-DEC-2024
- John Wallace departed Amman THU 05-DEC-2024 and will return 21-DEC-2024
\

== R&R Returns this past week
\

- Lee McKenna returned to EAB SAT 30-NOV-2024 \

== Upcoming R&R, DEC 2024. \
- Paul Conroy will depart 13-DEC-2024 and will return 29-DEC-2024
- Craig Marshall will depart 23-DEC-2024 and will return 08-JAN-2025

\
= MOVEMENT \
\
== Past
\
- Team traveled to T22 from JTC TUE 26-NOV-2024 \
- Team traveled from ATG to T22 WED 27-NOV-2024 \
- ME demobbed from our program WED 27-NOV-2024 \
- Team traveled from T22 to JTC THU 28-NOV-2024 \
- JE demobbed from our program SAT 30-NOV-2024 \
\
== Look ahead
\
- AMR submitted for Ben Warner to Shaddadi - Tentaively scheduled SUN 24-NOV-2024
\
\
= ACTIVE SITES (and leads) \
 \
- [x] Erbil - James Teanby
- [x] JTC/T22 - Justin Picard
- [x] KFAB - Steven Boyce
- [x] Buehring - Robert Haughey (UFC)
- [x] ATG - Salomon Munoz
- [x] Green Village - Jon Sharp
- [x] RLZ - David Anderson (R&R Backfill)
- [x] Shaddadi - Ben Warner
 \
 \
#pagebreak()

= INACTIVE SITES \
 \
- [ ] AL Asad
- [ ] MSSE
- [ ] BDSC
- [ ] MTH
- [ ] NLZ
- [ ] Buehring

= AREAS OF INSPECTION

== Iraq
=== Erbil
\
- Team 129

28-NOV – Initial inspection, CHU-VILLE, CHU-15 \
29-NOV – Initial inspection, CHU-VILLE, CHU-17 \
30-NOV – Initial inspection, CHU-VILLE, CHU-19 \
\

== Jordan
\
=== JTC/T22
\
- Team 116

28-NOV – Team(s) returned to JTC \
29-NOV – Initial inspection, JTC, DFAC, Distribution RM, CDPs 1 and 2 \ 
30-NOV – Initial inspection, H5, SSA Mezzanine lighting and Guard Towers 1, 2 and 3 \
\
- Team 132

29-NOV – Initial inspection, JTC, DFAC, Distribution RM, CDPs 3 and 5 \
30-NOV – Annual Physical, team split
 \

=== KFAB
 \
- Team 126
28-NOV – Initial inspection, CHU X045 \
29-NOV – Initial inspection, CHU X047 \
30-NOV – Annual Physical, team split \
\
 \
 #pagebreak()
== Kuwait \

=== BUEHRING
 \
=== BUEHRING (UFC)
 \
28-NOV – UFC Inspection, BLD 16-J, Pad 16 \
29-NOV – UFC Inspection, BLDs 16-D and 16-E, Pad 16 \
30-NOV – UFC Inspection, BLDs 16-F and 16-G, Pad 16 \
\
 \
== Syria
 \
=== ATG
\
- Team 128
28-NOV – Team checked in with base command, inventory of materials \
29-NOV – Initial Inspection, Accommodation Block Delta CDP-2 \
30-NOV – Initial inspection, Accommodation Block Bravo CDP-1 \
\
=== GREEN VILLAGE
 \
- Team 113
28-NOV – Initial inspection, BLD 115-1-2 \
29-NOV – Re-inspection and repairs, BLD 115-1-2 \
30-NOV – Re-inspection and repairs, BLD 115-1-2 \
\
=== RLZ
 \
- Team 135/131
28-NOV – Initial inspection, Motor-Pool-ODA-CHU-2 \
29-NOV – Initial inspection, Motor-Pool-ODA-CHU-3 \
30-NOV – Initial inspection, Engineering-Comp-Latrine-S-17-Internal \
 \
=== Shaddadi
 \
- Team
28-NOV – Initial inspection, C-Street SDP-5 \
29-NOV – Initial inspection, Aviation Village, MASCAL \
30-NOV – Re-inspection and repairs, Aviation Village, MASCAL \
\
\
= REQUESTS FOR SUPPORT
\
- Moores Team House.  Awaiting updates.
\
= ISSUES
\
NSTR
\
= NOTES
\
NSTR.

// Local Variables:
// tp--master-file: "/home/glenn/Notes/org/TFS_Updates/2024/11. NOV/07-NOV-2024.typ"
// End:
