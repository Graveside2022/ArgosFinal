# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of ArgosFinal seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

- [INSERT SECURITY EMAIL]

Please include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Time

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Expect

- We will acknowledge receipt of your vulnerability report
- We will confirm the problem and determine the affected versions
- We will audit code to find any similar problems
- We will prepare fixes for all supported releases
- We will release patches as soon as possible

### Preferred Languages

We prefer all communications to be in English.

### Disclosure Policy

We follow Coordinated Vulnerability Disclosure (CVD). We kindly request:

- Allow us reasonable time to address the issue before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service disruption
- Do not access or modify other users' data without explicit permission

## Security Considerations for RF/Radio Projects

Given the nature of this Software Defined Radio project, please pay special attention to:

1. **Frequency Usage**: Ensure all operations comply with local regulations
2. **Signal Injection**: Vulnerabilities that could allow unauthorized signal transmission
3. **Data Privacy**: Location data and signal metadata handling
4. **Hardware Access**: Unauthorized control of SDR hardware
5. **Network Security**: WebSocket and API endpoint protection

Thank you for helping keep ArgosFinal and its users safe!
