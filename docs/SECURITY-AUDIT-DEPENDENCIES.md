# Security Audit - Dependencies

**Report Date:** 2026-06-12
**Auditor:** DevOps Engineer Agent
**Project:** DailyStack MVP Launch

---

## Executive Summary

| Scope | Status |
|-------|--------|
| App Dependencies (`app/package.json`) | ✅ **PASS** |
| Root Dependencies (`package.json`) | ⚠️ **2 Moderate Issues** |

---

## Detailed Findings

### ✅ App Dependencies (Pass)

**Location:** `app/package.json`

```
npm audit --audit-level=high
Result: found 0 vulnerabilities
```

All production and development dependencies in the `app/` directory are clean with no high or critical vulnerabilities.

### ⚠️ Root Dependencies (Action Required)

**Location:** `package.json`

```
npm audit
Result: 2 moderate severity vulnerabilities
```

#### Vulnerability 1: esbuild SSRF via Development Server

| Property | Value |
|----------|-------|
| **Severity** | Moderate |
| **CVE/GHSA** | GHSA-67mh-4wv8-2f99 |
| **Affected Versions** | esbuild <= 0.24.2 |
| **Current Version** | esbuild@0.21.5 (transitive via vite@5.4.21) |
| **Fix Available** | Yes (vite@8.0.16 - breaking change) |

**Description:**
The esbuild development server allows any website to send requests and read responses due to missing origin validation. This is a development-only issue and does not affect production builds.

**Recommendation:**
- **For Development:** This is acceptable for local development. Ensure `npm run dev` is never exposed to untrusted networks.
- **For Production:** Production builds using `npm run build` are not affected by this vulnerability.

#### Vulnerability 2: Related Vite Dependency

| Property | Value |
|----------|-------|
| **Severity** | Moderate |
| **CVE/GHSA** | GHSA-4w7w-66w2-5vf9 |
| **Affected Versions** | vite <= 6.4.1 |
| **Current Version** | vite@5.4.21 |

**Description:**
Vite depends on a vulnerable version of esbuild. Same root cause as Vulnerability 1.

**Recommendation:**
Same as above - acceptable for development with network restrictions.

---

## Risk Assessment

### Development Environment
| Risk Level | Rationale |
|------------|------------|
| **LOW** | Development server vulnerabilities are contained to local network. No production data exposure. |

### Production Environment
| Risk Level | Rationale |
|------------|------------|
| **NONE** | Production builds use `vite build` which bundles code statically. The dev server is not deployed. |

---

## Recommended Actions

### Immediate (Optional)
Consider updating Vite to v6+ to resolve esbuild transitive dependency:

```bash
cd app && npm update vite
```

Note: Always test thoroughly after dependency updates.

### Best Practices Going Forward

1. **CI Pipeline Enforcement**
   - ✅ GitHub Actions CI already configured with `npm audit --audit-level=high`
   - Pipeline will fail on new high/critical vulnerabilities

2. **Dependabot Integration** (Recommended)
   Add Dependabot configuration to auto-update dependencies:

   ```yaml
   # .github/dependabot.yml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/app"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
   ```

3. **Regular Audits**
   - Schedule monthly dependency reviews
   - Monitor GitHub Security Advisories for project dependencies

---

## Dependency Inventory

### Production Dependencies (App)
| Package | Version | Purpose |
|---------|---------|---------|
| @stripe/stripe-js | ^9.8.0 | Stripe payment integration |
| @supabase/supabase-js | ^2.49.0 | Supabase client |
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | React DOM renderer |
| react-router-dom | ^6.28.0 | Routing |
| stripe | ^22.2.0 | Stripe server SDK |
| qrcode | ^1.5.4 | QR code generation |
| lucide-react | ^0.474.0 | Icons |
| motion | ^11.18.2 | Animations |
| clsx | ^2.1.1 | Class utilities |

### Development Dependencies (App)
| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^6.4.3 | Build tool |
| typescript | ~5.6.2 | Type checking |
| @playwright/test | ^1.60.0 | E2E testing |
| tailwindcss | ^3.4.17 | Styling |
| @vitejs/plugin-react | ^4.3.4 | React plugin |
| autoprefixer | ^10.4.20 | CSS prefixing |
| postcss | ^8.5.1 | CSS processing |

---

## Conclusion

The DailyStack application dependencies are in good standing for production deployment. The two moderate vulnerabilities found in the root workspace are development-only concerns and do not affect production builds.

**Status: Ready for Production** ✅
