import {
  Wifi,
  Lock,
  CalendarDays,
  ChartNoAxesCombined,
  Settings,
  Box,
  Users,
  FileText,
  Bell,
  CircleDollarSign,
  Cloud,
  HardHat,
  Menu,
  X,
  Gauge,
  Radar,
  MapPin,
  Building2,
  Cog,
  DraftingCompass,
  ShieldCheck,
  Ruler,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CraneSVG, IsoBuilding, BlueprintSVG } from "../components/landing/Deco";
import CommandCenter from "../components/landing/CommandCenter";
import "../styles/landing.css";
import "../styles/landing-index.css";
import "../styles/landing-theme.css";
import "../styles/landing-animations.css";

function CountUp({ end, decimals = 0, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const [value, setValue] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(end * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, duration]);

  const shown = value ?? 0;
  const formatted = shown.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className="count-up" data-count={end}>
      {formatted}
      {suffix}
    </span>
  );
}

function SectionDeco() {
  return (
    <div className="section-deco" aria-hidden="true">
      <HardHat className="deco-icon d1" />
      <Building2 className="deco-icon d2" />
      <Cog className="deco-icon d3" />
      <DraftingCompass className="deco-icon d4" />
      <ShieldCheck className="deco-icon d5" />
      <Ruler className="deco-icon d6" />
      <CraneSVG className="deco-crane dr" />
    </div>
  );
}

function LandingPage() {
  const [loaderDone, setLoaderDone] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [theme] = useState(() => {
    const saved = localStorage.getItem("bt-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });
  const appRef = useRef(null);
  const progressRef = useRef(null);
  const navbarRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setLoaderDone(true);
      if (appRef.current) appRef.current.classList.add("hero-ready");
    }, 1300);
    const t2 = setTimeout(() => setLoaderGone(true), 2050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("bt-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = appRef.current;
    if (!root) return;
    root.classList.add("anim-ready");

    const grids = [
      ".modules-grid",
      ".roles-grid",
      ".workflow-grid",
      ".tech-grid",
      ".categories-grid",
      ".dashboard-grid",
      ".stats-container",
      ".admin-list",
    ];
    grids.forEach((selector) => {
      const grid = root.querySelector(selector);
      if (!grid) return;
      Array.from(grid.children).forEach((child, index) =>
        child.style.setProperty("--i", index)
      );
    });

    const revealSelector = [
      ".section-heading",
      ".stat-item",
      ".module-card",
      ".role-card",
      ".dashboard-card",
      ".cmd-panel",
      ".workflow-card",
      ".tech-card",
      ".category-card",
      ".cta-box",
      ".admin-list > div",
    ].join(", ");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );

    root.querySelectorAll(revealSelector).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const progress =
        doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight);
      if (progressRef.current)
        progressRef.current.style.setProperty("--p", progress);
      if (navbarRef.current)
        navbarRef.current.classList.toggle("nav-scrolled", doc.scrollTop > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty(
        "--ptx",
        ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3)
      );
      hero.style.setProperty(
        "--pty",
        ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3)
      );
    };
    const onLeave = () => {
      hero.style.setProperty("--ptx", 0);
      hero.style.setProperty("--pty", 0);
    };
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const tiltables = document.querySelectorAll(
      ".category-card, .dashboard-card"
    );
    const cleanups = [];
    tiltables.forEach((el) => {
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-py * 5).toFixed(2)}deg`);
        el.classList.add("tilt-hover");
      };
      const onLeave = () => {
        el.classList.remove("tilt-hover");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const modules = [
    {
      icon: Lock,
      title: "1. User Authentication & RBAC",
      description:
        "Secure JWT authentication, profile management, and role-based access mapping your company hierarchy.",
    },
    {
      icon: CalendarDays,
      title: "2. Project Management",
      description:
        "Schedule construction pipelines, configure milestones, update tasks, and orchestrate project closure phases.",
    },
    {
      icon: ChartNoAxesCombined,
      title: "3. Site Progress Monitoring",
      description:
        "Submit daily logs and weekly progress summaries, monitor delays, and access precise technical activity logs.",
    },
    {
      icon: Settings,
      title: "4. Resource Management",
      description:
        "Allocate complex resources, coordinate asset maintenance profiles, and monitor plant utilization telemetry.",
    },
    {
      icon: Box,
      title: "5. Material & Inventory",
      description:
        "Track and organize material streams, monitor stock metrics, and manage multi-site structural material counts.",
    },
    {
      icon: Users,
      title: "6. Workforce Management",
      description:
        "Register sub-contractors, monitor on-site shift schedules, log geofenced attendance, and oversee payroll.",
    },
    {
      icon: FileText,
      title: "7. Procurement Management",
      description:
        "Organize vendor registers, issue purchase orders, coordinate timelines, and automate invoice processing.",
    },
    {
      icon: Bell,
      title: "8. Notification System",
      description:
        "Distribute instant project updates, issue task assignments, log deadline flags, and broadcast safety announcements.",
    },
    {
      icon: ChartNoAxesCombined,
      title: "9. Dashboard & Analytics",
      description:
        "Visualize actual vs planned pipelines, view budget burn rates, track labor velocity, and parse hardware stats.",
    },
    {
      icon: FileText,
      title: "10. Reports & Documentation",
      description:
        "Generate custom progress and technical reports with instant export capabilities.",
    },
    {
      icon: CircleDollarSign,
      title: "11. Budget & Cost Management",
      description:
        "Configure financial cost ranges, register site expenses, track supply costs, and evaluate margins.",
    },
    {
      icon: Cloud,
      title: "12. Integration & Deployment",
      description:
        "Continuous deployment pipelines utilizing production Docker clusters for zero system downtime.",
    },
  ];

  const roles = [
    {
      icon: Lock,
      title: "Administrator",
      description:
        "Manage system settings, coordinate tenant licenses, configure global access permissions, and parse platform analytics.",
    },
    {
      icon: CalendarDays,
      title: "Project Manager",
      description:
        "Oversee overall timeline health, authorize major supply purchase requests, allocate crew budgets, and export stakeholder updates.",
    },
    {
      icon: Settings,
      title: "Site Engineer",
      description:
        "Submit daily structural reports directly from the terminal, flag critical delay variables, and review design specifications.",
    },
    {
      icon: Users,
      title: "Contractor",
      description:
        "Track assigned work scopes, manage subcontractor crews, log operational metrics, and request material supplies.",
    },
    {
      icon: Bell,
      title: "Worker",
      description:
        "Clock shifts through mobile terminal geofencing, access personal task pipelines, and track verification hours.",
    },
    {
      icon: ChartNoAxesCombined,
      title: "Client / Owner",
      description:
        "View high-level milestone progress, track project budgets, and review structured project certificates.",
    },
  ];

  const techStack = [
    {
      category: "FRONTEND",
      items: [
        ["Angular", "Scalable modular SPA"],
        ["TypeScript", "Strictly typed application logic"],
        ["Angular Material", "Enterprise-grade component library"],
        ["Chart.js", "Flexible interactive visualizations"],
      ],
    },
    {
      category: "BACKEND & DB",
      items: [
        ["Python FastAPI", "Asynchronous high-performance core API"],
        ["SQLAlchemy", "Advanced programmatic query generation"],
        ["PostgreSQL", "Robust ACID-compliant storage"],
        ["Redis Cache", "Sub-millisecond real-time telemetry queries"],
      ],
    },
    {
      category: "INFRASTRUCTURE",
      items: [
        ["Docker & Nginx", "Containerized production matrices"],
        ["GitHub Actions", "Automated continuous delivery"],
        ["AWS Cloud", "Enterprise-grade secure hosting"],
        ["Grafana", "Visual operations monitoring"],
      ],
    },
    {
      category: "STORAGE & MEDIA",
      items: [
        ["AWS S3", "Document and blueprint archive"],
        ["Cloudinary", "Site photo asset CDN"],
      ],
    },
  ];

  const categories = [
    {
      title: "Industrial",
      text: "Heavy manufacturing hubs, factories, and processing plants.",
      image: "/images/industrial.jpg",
    },
    {
      title: "Residential",
      text: "Multi-family housing developments, estates, and urban towers.",
      image: "/images/residential.jpg",
    },
    {
      title: "Commercial",
      text: "Corporate office parks, retail outlets, and shopping complexes.",
      image: "/images/commercial.jpg",
    },
    {
      title: "Infrastructure",
      text: "Highway systems, bridges, transport, and utility networks.",
      image: "/images/infrastructure.jpg",
    },
    {
      title: "Government",
      text: "Civil administration zones, educational complexes, and public parks.",
      image: "/images/government.jpg",
    },
  ];

  return (
    <div className="app" ref={appRef}>
      {/* LOADER + SCROLL PROGRESS */}

      {!loaderGone && (
        <div
          className={`page-loader${loaderDone ? " loader-done" : ""}`}
          aria-hidden="true"
        >
          <div className="loader-mark">
            <Wifi size={20} />
          </div>

          <div className="loader-logo">
            <span>
              Build<span>Track</span>
            </span>
          </div>

          <div className="loader-crane">
            <CraneSVG className="loader-crane-svg" />
          </div>

          <div className="loader-track">
            <span></span>
          </div>

          <p>Initializing command center</p>
        </div>
      )}

      <div className="scroll-progress" ref={progressRef} aria-hidden="true"></div>

      {/* NAVBAR */}

      <nav className="navbar" ref={navbarRef}>
        <div className="nav-container">
          <a href="#home" className="logo">
            <span className="logo-word">
              Build<span className="logo-track">Track</span>
            </span>
          </a>

          <div className="nav-links">
            <a href="#modules">Modules</a>
            <a href="#roles">User Roles</a>
            <a href="#dashboards">Dashboard</a>
            <a href="#workflow">How It Works</a>
            <a href="#tech">Tech Stack</a>
          </div>

          <div className="nav-actions">
            <button
  className="btn btn-primary"
  onClick={() => (window.location.href = "/register")}
>
  Get Started
</button>

            <button
              className="menu-toggle"
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`mobile-menu-overlay${menuOpen ? " open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      ></div>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">MENU</span>

          <button
            className="mobile-menu-close"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mobile-menu-links">
          <a href="#modules" onClick={closeMenu}>
            Modules
          </a>
          <a href="#roles" onClick={closeMenu}>
            User Roles
          </a>
          <a href="#dashboards" onClick={closeMenu}>
            Dashboard
          </a>
          <a href="#workflow" onClick={closeMenu}>
            How It Works
          </a>
          <a href="#tech" onClick={closeMenu}>
            Tech Stack
          </a>
        </div>
      </div>

      {/* HERO */}

      <section className="hero" id="home">
        <div className="hero-container">
          <div className="tag">NEXT-GEN CONSTRUCTION COMMAND</div>

          <h1>
            BuildTrack: Construction Project
            <br />
            Management & Site Monitoring
            <br />
            Platform
          </h1>

          <p>
            A full-stack web application that helps construction companies,
            contractors, project managers, engineers, and clients efficiently
            manage construction projects, track site progress, monitor
            resources, manage budgets, coordinate teams, and generate reports
            from a centralized platform.
          </p>

          <div className="hero-buttons">
           <button
  className="btn btn-primary"
  onClick={() => (window.location.href = "/register")}
>
  Get Started
</button>

            
          </div>

          <div className="hero-image">
            <div
              className={`skeleton-img${heroImgLoaded ? " hide" : ""}`}
            ></div>

            <img
              src="/images/hero.jpg"
              alt="Modern construction project"
              onLoad={() => setHeroImgLoaded(true)}
            />
            <div className="hero-overlay"></div>

            <div className="hero-float" aria-hidden="true">
              <div className="float-slide sl-a">
                <span className="float-chip chip-a">
                  <Gauge size={16} />
                </span>
                <span className="float-chip chip-b">
                  <Radar size={16} />
                </span>
                <span className="float-chip chip-c">
                  <MapPin size={16} />
                </span>
              </div>

              <div className="float-slide sl-b">
                <BlueprintSVG className="float-blueprint" />
              </div>

              <div className="float-slide sl-c">
                <div className="iso-wrap">
                  <IsoBuilding className="float-iso" />
                </div>
              </div>

              <div className="float-slide sl-d">
                <CraneSVG className="float-crane" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3>
              <CountUp end={12} /> Modules
            </h3>
            <p>Fully Integrated Core Systems</p>
          </div>

          <div className="stat-item">
            <h3>
              <CountUp end={6} /> User Roles
            </h3>
            <p>Custom RBAC Access Control</p>
          </div>

          <div className="stat-item">
            <h3>Real-Time</h3>
            <p>Live Telemetry & Site Monitoring</p>
          </div>

          <div className="stat-item">
            <h3>Centralized</h3>
            <p>Unified Enterprise Platform</p>
          </div>
        </div>
      </section>

      {/* MODULES */}

      <section className="section" id="modules">
        <SectionDeco />

        <div className="container">
          <div className="section-heading">
            <div className="tag">PLATFORM ARCHITECTURE</div>

            <h2>12 Integrated Core Modules</h2>

            <p>
              Comprehensive management matrices designed to unite operations,
              procurement, finance, and engineering into one digital command
              structure.
            </p>
          </div>

          <div className="modules-grid">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <div className="module-card" key={index}>
                  <div className="module-icon">
                    <Icon size={20} />
                  </div>

                  <h3>{module.title}</h3>

                  <p>{module.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* USER ROLES */}

      <section className="section roles-section" id="roles">
        <SectionDeco />

        <div className="container">
          <div className="section-heading">
            <div className="tag">COLLABORATIVE ECOSYSTEM</div>

            <h2>6 Custom Tailored User Roles</h2>

            <p>
              Synchronize everyone from the head office to the field crew. Each
              role experiences a personalized interface focused on their
              immediate priorities.
            </p>
          </div>

          <div className="roles-grid">
            {roles.map((role, index) => {
              const Icon = role.icon;

              return (
                <div className="role-card" key={index}>
                  <div className="role-icon">
                    <Icon size={20} />
                  </div>

                  <div>
                    <h3>{role.title}</h3>

                    <p>{role.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DASHBOARDS */}

      <section className="section" id="dashboards">
        <SectionDeco />

        <div className="container">
          <div className="section-heading">
            <div className="tag">COMMAND CENTER</div>

            <h2>Powerful Dashboards for Every Role</h2>

            <p>
              Real-time operations management screens that transform raw
              data telemetry into immediately actionable insights.
            </p>
          </div>

          <CommandCenter />
        </div>
      </section>

      {/* WORKFLOW */}

      <section className="section workflow-section" id="workflow">
        <SectionDeco />

        <div className="container">
          <div className="section-heading">
            <div className="tag">DEPLOYMENT CYCLE</div>

            <h2>Streamlined Execution in 4 Steps</h2>

            <p>
              From initial project setup to stakeholder handover reports,
              standardize your system pipeline.
            </p>
          </div>

          <div className="workflow-grid">
            <div className="workflow-card">
              <div className="step-number">01</div>
              <h3>Plan Projects</h3>
              <p>
                Define task structures, allocate RBAC profiles for your
                administrative stakeholders.
              </p>
            </div>

            <div className="workflow-card">
              <div className="step-number">02</div>
              <h3>Track Progress</h3>
              <p>
                Contractors submit geolocated progress updates and site logs
                directly from mobile devices.
              </p>
            </div>

            <div className="workflow-card">
              <div className="step-number">03</div>
              <h3>Manage Resources</h3>
              <p>
                Coordinate material flow requests and schedule heavy machinery
                maintenance to prevent site downtime.
              </p>
            </div>

            <div className="workflow-card">
              <div className="step-number">04</div>
              <h3>Generate Reports</h3>
              <p>
                Instantly compile complete progress history and structural cost
                summaries for formal PDF or Excel export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}

      <section className="section tech-section" id="tech">
        <SectionDeco />

        <div className="container">
          <div className="section-heading">
            <div className="tag">TECHNICAL SPECIFICATIONS</div>

            <h2>Enterprise-Grade Tech Stack</h2>

            <p>
              Engineered with modern technologies to ensure lightning-fast
              database writes, responsive screens, and strict site security.
            </p>
          </div>

          <div className="tech-grid">
            {techStack.map((stack, index) => (
              <div className="tech-column" key={index}>
                <h4>{stack.category}</h4>

                {stack.items.map((item, itemIndex) => (
                  <div className="tech-card" key={itemIndex}>
                    <h3>{item[0]}</h3>
                    <p>{item[1]}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="section categories-section">
        <SectionDeco />

        <div className="container">
          <div className="section-heading">
            <div className="tag">VERSATILITY SPECTRUM</div>

            <h2>Optimized for All Project Categories</h2>

            <p>
              Whether constructing multi-unit residential structures or
              managing sprawling public utility contracts.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((category, index) => (
              <div className="category-card" key={index}>
                <img src={category.image} alt={category.title} />

                <div className="category-overlay"></div>

                <div className="category-content">
                  <h3>{category.title}</h3>
                  <p>{category.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="section">
        <SectionDeco />

        <div className="container">
          <div className="cta-box">
            <div className="tag">SCALE YOUR OPERATIONS</div>

            <h2>
              Ready to Streamline Your Construction
              <br />
              Projects?
            </h2>

            <p>
              Join leading contractors and engineering teams utilizing
              BuildTrack to secure scheduling timelines and optimize resource
              costs.
            </p>

            <div className="hero-buttons">
             <button
  className="btn btn-primary"
  onClick={() => (window.location.href = "/register")}
>
  Get Started for Free
</button>

              <button className="btn btn-outline btn-large">
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer>
        <div className="footer-container">
          <div className="footer-brand">
            <a href="#home" className="logo">
              <div className="logo-icon">
                <Wifi size={16} />
              </div>

              <span>
                Build<span>Track</span>
              </span>
            </a>

            <p>
              Centralized telemetry and command structures for industrial,
              commercial, and civil construction projects.
            </p>
          </div>

          <div className="footer-column">
            <h4>FEATURES</h4>
            <a href="#modules">Daily Progress Logs</a>
            <a href="#modules">Resource Telemetry</a>
            <a href="#modules">Material Tracking</a>
            <a href="#modules">Shift Scheduling</a>
          </div>

          <div className="footer-column">
            <h4>MODULES</h4>
            <a href="#roles">RBAC Access Control</a>
            <a href="#dashboards">Cost & Budget Matrix</a>
            <a href="#modules">Procurement Flow</a>
            <a href="#dashboards">System Metrics</a>
          </div>

          <div className="footer-column">
            <h4>COMPANY</h4>
            <a href="#home">About Platform</a>
            <a href="#tech">Developer Docs</a>
            <a href="#home">Expert Consultation</a>
            <a href="#home">Enterprise Solutions</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 BuildTrack Platform Inc. All rights reserved.</p>

          <div>
            <span>System Status</span>
            <span>Security Compliance</span>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;