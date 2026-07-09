export interface Article {
  slug: string;
  title: string;
  snippet: string;
  content: string; // Markdown format, including frontmatter for the infobox
}

export interface CategoryInfo {
  name: string;
  description: string;
  articles: Article[];
}

export const CATEGORIES_DATA: Record<string, CategoryInfo> = {
  departments: {
    name: "Departments",
    description: "Explore the academic departments and engineering disciplines at IIT Gandhinagar.",
    articles: [
      {
        slug: "computer-science",
        title: "Computer Science & Engineering",
        snippet: "A leading department focused on AI, machine learning, systems, theory, and cryptography.",
        content: `---
image: https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600
imageAlt: Computer Labs
rows:
  - label: Established
    value: 2008
    type: text
  - label: Degrees Offered
    value: B.Tech, M.Tech, Ph.D.
    type: text
  - label: Head of Dept
    value: Prof. Anirban Sengupta
    type: text
  - label: Research Focus
    value: [AI/ML, Security, Algorithms]
    type: badge
---

# Computer Science & Engineering

Welcome to the Computer Science and Engineering (CSE) discipline at IIT Gandhinagar. Established in 2008, the department has grown into a hub of innovation and academic excellence.

## Academic Programs

The department offers undergraduate and postgraduate programs designed to prepare students for leadership roles in industry and research.

### B.Tech Program
A comprehensive four-year curriculum covering data structures, computer networks, compiler design, algorithms, and artificial intelligence.

### M.Tech & Ph.D.
Postgraduate programs focusing on advanced research, system engineering, and cutting-edge publications in global conferences.

## Research Areas

Our faculty and students work on diverse research topics:

- **Artificial Intelligence & Machine Learning**: Deep learning, computer vision, and NLP.
- **Theory & Algorithms**: Graph theory, parameterised complexity, and cryptography.
- **Systems & Networks**: Cloud computing, distributed systems, and computer architecture.`
      },
      {
        slug: "electrical-engineering",
        title: "Electrical Engineering",
        snippet: "Pioneering research in power systems, microelectronics, control systems, and signal processing.",
        content: `---
image: https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600
imageAlt: Electronics Lab
rows:
  - label: Established
    value: 2008
    type: text
  - label: Faculty Count
    value: 18
    type: text
  - label: Key Labs
    value: VLSI, Power Systems, Robotics
    type: text
  - label: Focus Area
    value: [Renewables, Semiconductors]
    type: badge
---

# Electrical Engineering

The Electrical Engineering (EE) department at IIT Gandhinagar is dedicated to advancing technology in power systems, electronics, controls, and communications.

## Laboratories & Infrastructure

Our state-of-the-art laboratory facilities support both coursework and high-impact research.

### VLSI & Microelectronics Lab
Equipped with industry-standard CAD tools for IC design, semiconductor simulation, and testing.

### Power & Energy Systems Lab
Focuses on smart grids, renewable energy integration, and battery management systems.

## Key Research Projects

Faculty members are engaged in several sponsored projects including solar microgrids, autonomous vehicle controls, and next-generation biosensors.`
      }
    ]
  },
  faculty: {
    name: "Faculty Profiles",
    description: "Meet the world-class educators, researchers, and mentors at IIT Gandhinagar.",
    articles: [
      {
        slug: "prof-amit-prashant",
        title: "Prof. Amit Prashant",
        snippet: "Professor in Civil Engineering specializing in Geotechnical Engineering and soil-structure interaction.",
        content: `---
image: https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600
imageAlt: Prof. Amit Prashant
rows:
  - label: Designation
    value: Professor (Civil Eng.)
    type: text
  - label: PhD Location
    value: University of Tennessee
    type: text
  - label: Joined IITGN
    value: 2010
    type: text
  - label: Research
    value: [Soil Dynamics, Earthquake Eng.]
    type: badge
---

# Prof. Amit Prashant

Prof. Amit Prashant is a leading researcher and educator in Civil Engineering, with an emphasis on Geotech. He has held several key administrative positions at IIT Gandhinagar.

## Academic & Research Interests

His research focuses on solving complex geotechnical problems under seismic loads.

### Geotechnical Earthquake Engineering
Investigating soil liquefaction, ground improvement techniques, and foundation performance during seismic events.

### Soil Mechanics & Modeling
Development of advanced constitutive models for granular materials and clays.`
      },
      {
        slug: "prof-kabeer-jaisuwal",
        title: "Prof. Kabeer Jaisuwal",
        snippet: "Associate Professor in Mechanical Engineering researching fluid mechanics and computational modeling.",
        content: `---
image: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600
imageAlt: Faculty Profile
rows:
  - label: Designation
    value: Associate Professor (ME)
    type: text
  - label: Research Group
    value: Thermal Fluids Group
    type: text
  - label: Key Area
    value: [CFD, Microfluidics]
    type: badge
---

# Prof. Kabeer Jaisuwal

Prof. Kabeer Jaisuwal teaches fluid mechanics, thermodynamics, and heat transfer. His lab is renowned for computational breakthroughs in micro-scale flows.

## Core Courses Taught

- ME 301: Fluid Mechanics
- ME 405: Computational Fluid Dynamics`
      }
    ]
  },
  courses: {
    name: "Courses Info",
    description: "Browse student reviews, course structures, and grading statistics for various disciplines.",
    articles: [
      {
        slug: "cs-101",
        title: "CS 101: Introduction to Computing",
        snippet: "A foundational course introducing algorithms, Python programming, and computational thinking.",
        content: `---
image: https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600
imageAlt: Code Editing Screen
rows:
  - label: Code
    value: CS 101
    type: text
  - label: Credits
    value: 4 (L-T-P: 3-0-2)
    type: text
  - label: Default Language
    value: Python
    type: text
  - label: Typical Grade Distribution
    value: [High A/B, Moderate C]
    type: badge
---

# CS 101: Introduction to Computing

CS 101 is the gateway course to computer science at IIT Gandhinagar, taken by all first-year undergraduate students.

## Course Syllabus

- **Introduction to Algorithms**: Flowcharts, pseudocode, and basic logic.
- **Python Syntax**: Variables, loops, lists, dictionaries, and functions.
- **Object-Oriented Programming**: Simple classes and inheritance.
- **Elementary Data Structures**: Stacks, queues, and search/sort algorithms.`
      },
      {
        slug: "hs-201",
        title: "HS 201: World Literature",
        snippet: "An exploration of critical literary texts across continents, emphasizing analytical essay writing.",
        content: `---
image: https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600
imageAlt: Library Books
rows:
  - label: Code
    value: HS 201
    type: text
  - label: Credits
    value: 3
    type: text
  - label: Reading List Size
    value: ~6 Novels + Poetry
    type: text
  - label: Categories
    value: [Humanities, Literature]
    type: badge
---

# HS 201: World Literature

A highly interactive humanities course exploring historical context, post-colonial themes, and literary critique.`
      }
    ]
  },
  research: {
    name: "Research & Labs",
    description: "Discover state-of-the-art research centers and laboratories driving impact.",
    articles: [
      {
        slug: "cognitive-science-lab",
        title: "Cognitive Science Laboratory",
        snippet: "Interdisciplinary research combining neuroscience, psychology, and artificial intelligence.",
        content: `---
image: https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600
imageAlt: Cognitive Research
rows:
  - label: Director
    value: Prof. J. S. Rajput
    type: text
  - label: Founded
    value: 2013
    type: text
  - label: Key Tech
    value: EEG, Eye Trackers, VR
    type: text
  - label: Core Domains
    value: [Neuroscience, AI, Behavior]
    type: badge
---

# Cognitive Science Laboratory

The CogSci Lab at IITGN explores the mysteries of the human mind through advanced imaging and behavioral tests.`
      }
    ]
  },
  hostels: {
    name: "Hostels Guide",
    description: "Everything you need to know about your home at IIT Gandhinagar.",
    articles: [
      {
        slug: "aibaan-hostel",
        title: "Aibaan Hostel",
        snippet: "A vibrant residential block known for its central courtyard and active common rooms.",
        content: `---
image: https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600
imageAlt: Hostel Building
rows:
  - label: Capacity
    value: ~240 students
    type: text
  - label: Rooms Type
    value: Single & Double Sharing
    type: text
  - label: Mascot
    value: The Phoenix
    type: text
  - label: Amenities
    value: [Gym, Music Room, TT]
    type: badge
---

# Aibaan Hostel

Aibaan is one of the oldest and most popular student hostels on campus. It houses a diverse community of students.`
      }
    ]
  },
  facilities: {
    name: "Campus Facilities",
    description: "Explore sports facilities, dining options, medical center, and library resources.",
    articles: [
      {
        slug: "sports-complex",
        title: "Sports Complex",
        snippet: "World-class athletic infrastructure hosting indoor and outdoor sports facilities.",
        content: `---
image: https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600
imageAlt: Sports Court
rows:
  - label: Area
    value: 10 Acres
    type: text
  - label: Courts
    value: Squash, Badminton, Basketball
    type: text
  - label: Swimming Pool
    value: Olympic Size (50m)
    type: text
  - label: Facilities
    value: [Gym, Running Track, Arena]
    type: badge
---

# Sports Complex

The IIT Gandhinagar Sports Complex provides students and faculty with exceptional sports amenities.`
      }
    ]
  },
  clubs: {
    name: "Student Clubs",
    description: "Unleash your potential in coding, robotics, drama, music, dance, and more.",
    articles: [
      {
        slug: "coding-club",
        title: "The Coding Club",
        snippet: "The premier student tech hub for developers, competitive programmers, and designers.",
        content: `---
image: https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600
imageAlt: Hacker Screen
rows:
  - label: Coordinator
    value: Rohan Sharma
    type: text
  - label: Main Events
    value: Hackathons, DevTalks
    type: text
  - label: Tech Stack
    value: React, Node, PyTorch, Go
    type: text
  - label: Subdivisions
    value: [AI/ML, WebDev, CP]
    type: badge
---

# The Coding Club

The Coding Club is the largest developer community at IIT Gandhinagar, fostering collaborative building and coding contests.`
      }
    ]
  },
  fests: {
    name: "Student Life (Fests)",
    description: "Relive the excitement of Amalthea, Blithchron, and Hallabol.",
    articles: [
      {
        slug: "amalthea",
        title: "Amalthea",
        snippet: "IITGN's annual technical summit showcasing innovations, technical contests, and guest lectures.",
        content: `---
image: https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600
imageAlt: Tech Conference
rows:
  - label: Event Type
    value: Technical Fest
    type: text
  - label: Annual Dates
    value: October / November
    type: text
  - label: Key Highlights
    value: Symposium, Exhibition
    type: text
  - label: Competitions
    value: [RoboQuest, CodeGenesis]
    type: badge
---

# Amalthea

Amalthea is India's first student-run technical summit that focuses on spreading knowledge rather than just competing.`
      }
    ]
  },
  calendar: {
    name: "Academic Calendar",
    description: "Keep track of semesters, mid-sem exams, end-sems, and institute holidays.",
    articles: [
      {
        slug: "semester-dates-2026",
        title: "Semester Dates 2026",
        snippet: "Comprehensive list of dates for registration, exam blocks, and breaks for 2026.",
        content: `---
image: https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600
imageAlt: Calendar Planner
rows:
  - label: Year
    value: 2026
    type: text
  - label: Fall Semester
    value: Jan 3 - May 5
    type: text
  - label: Spring Semester
    value: Aug 1 - Dec 4
    type: text
  - label: Main Breaks
    value: [Summer Break, Winter Break]
    type: badge
---

# Semester Dates 2026

Keep track of the official academic calendar timeline for IIT Gandhinagar.`
      }
    ]
  },
  policies: {
    name: "Institute Policies",
    description: "Read about graduation criteria, leave policies, and code of conduct guidelines.",
    articles: [
      {
        slug: "grading-policy",
        title: "Grading Policy",
        snippet: "Details on letter grades, cumulative performance indices (CPI), and minimum passing scores.",
        content: `---
image: https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600
imageAlt: Grading Sheet
rows:
  - label: Grading Scale
    value: 10-Point Scale
    type: text
  - label: Passing CPI
    value: 5.0
    type: text
  - label: Evaluation
    value: Continuous Evaluation
    type: text
  - label: Grades
    value: [AP, AA, AB, BB, BC, CC, CD, DD, F]
    type: badge
---

# Grading Policy

IIT Gandhinagar implements a continuous evaluation system to gauge student performance through assignments, quizzes, and projects.`
      }
    ]
  },
  placements: {
    name: "Placement Stats",
    description: "Analyze trends, recruiter information, and sector-wise distribution profiles.",
    articles: [
      {
        slug: "placements-2025",
        title: "Placements Report 2025",
        snippet: "A breakdown of average packages, placement percentage, and core vs non-core distribution.",
        content: `---
image: https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600
imageAlt: Growth Graph
rows:
  - label: Reporting Year
    value: 2025
    type: text
  - label: Placement Rate
    value: ~92%
    type: text
  - label: Highest CTC
    value: 52 LPA
    type: text
  - label: Top Recruiting Sectors
    value: [Software, Finance, Core Eng]
    type: badge
---

# Placements Report 2025

The 2025 placement season saw high engagement from recruiters across engineering, data science, consulting, and finance.`
      }
    ]
  }
};
