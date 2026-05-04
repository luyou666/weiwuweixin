# Privacy Policy

Last Updated: May 3, 2026

## Overview

Weiwuweixin ("the Software") is an open-source, self-hostable item rating and consensus calculation platform. The software code is open-sourced under the MIT License, allowing anyone to download, deploy, and operate their own instance. **This Privacy Policy applies to the specific instance operated by the deployer**; the software developers do not directly collect, store, or process any user data.

**Important Note**: As the Software adopts a self-hosted architecture, the deployer of each instance serves as the Data Controller for that instance. This Privacy Policy is provided as a template for deployers to reference and adapt. Deployers should adjust it according to their actual circumstances and independently bear the legal responsibilities of a Data Controller.

---

## 1. Information Collection

### 1.1 Information Actively Provided by Users

When you use an instance of the Software, the following information may be collected and stored in the deployer's database:

| Information Type | Details | Description |
|------------------|---------|-------------|
| Device Identifier | `deviceId` (anonymous device identifier) | Used to identify unique devices without login, enabling basic functionality without account registration |
| Account Information | Email address | Provided when logging in via JWT authentication |
| Profile Information | Nickname | A publicly displayed name set by the user |
| User Contributions | Published rankings, rating records, comments | All content created and published by users on the platform |

### 1.2 Automatically Collected Technical Information

When you access the Software, the server may automatically log the following technical information:

- **IP Address**: Necessary technical data for network communication
- **Browser Type and Version**: Automatically obtained via HTTP request headers
- **Access Time and Date**: Timestamps recorded in server logs
- **Requested Pages or API Endpoints**: Standard web server log entries

This information is typically recorded automatically by web servers (e.g., Nginx, Caddy) or application frameworks (Next.js, Fastify) as part of standard internet service practices.

---

## 2. Use of Information

Collected information is used for the following purposes:

1. **Providing Core Rating Services**: Enabling you to create rankings, rate items, and view rating results
2. **Computing Consensus Scores**: Calculating group consensus metrics based on multi-user rating data — a core feature of the Software
3. **Displaying User Profiles**: Publicly showing your nickname, published rankings, and rating activities (content you actively publish on the platform is publicly visible by default)
4. **Community Interaction**: Supporting comments, discussions, and other community features
5. **Technical Operations**: Ensuring stable service operation, troubleshooting, and preventing abuse

---

## 3. Information Storage

### 3.1 Storage Method

All user data is stored in a **PostgreSQL** relational database controlled by the deployer. Some session and cache data may be stored in **Redis**.

### 3.2 Data Location

The physical location and region of data storage depend entirely on where the deployer hosts their servers. Users should consult the specific instance operator for information regarding data storage locations.

### 3.3 Self-Control of Data

Given the Software's open-source, self-hosted architecture, anyone — including users themselves — can deploy their own independent instance and thus maintain full control over their data. We encourage users with high data sovereignty requirements to consider this option.

### 3.4 Data Retention

The data retention period is determined by the deployer. In principle, user data will be retained until the user actively deletes it or until the deployer removes it for maintenance purposes.

---

## 4. Cookies and Tracking

### 4.1 Cookie Usage

The Software uses **only essential session cookies** for:

- Maintaining login state (JWT token storage)
- Basic session management

### 4.2 Third-Party Tracking

The Software **does not embed any third-party tracking scripts**, contains no advertising SDKs, and uses no analytics trackers (such as Google Analytics). The software code contains no logic for transmitting user behavior data to third-party servers.

### 4.3 Disabling Cookies

You may disable cookies through your browser settings, though this may prevent the login functionality from working properly.

---

## 5. Information Sharing and Disclosure

### 5.1 General Principle

The Software **does not sell, rent, or share your personal information with third parties**. The code contains no logic for transmitting user data to developer servers or any third-party services (except for authentication emails, if the instance has configured an email service).

### 5.2 Legally Required Disclosures

Under the following circumstances, the deployer may need to disclose your information:

- Compliance with laws, regulations, or lawful requests from administrative or judicial authorities
- Protection of the rights, property, or safety of the deployer, users, or the public
- Detection, prevention, or handling of fraud, security, or technical issues

### 5.3 Public Information

Please note that content you **actively publish** on the platform (such as rankings, ratings, and comments) is publicly visible by default. Exercise caution when posting such information.

---

## 6. User Rights

As a data subject, you have the following rights regarding your personal data stored in an instance:

| Right | Description | How to Exercise |
|-------|-------------|-----------------|
| **Right of Access** | View your personal data | Through your profile page or by contacting the deployer |
| **Right to Rectification** | Correct inaccurate or outdated information | Modify through account settings |
| **Right to Erasure** | Delete your account and associated data | Through account settings or by contacting the deployer |
| **Right to Data Portability** | Export your data in a structured format | Contact the deployer to obtain a copy of your data |
| **Right to Restrict Processing** | Restrict how your data is processed | Contact the deployer with your request |

Implementation of these rights is the responsibility of each instance's deployer. If the deployer fails to promptly respond to your request, you have the right to lodge a complaint with the relevant data protection supervisory authority.

---

## 7. Data Security

### 7.1 Security Measures

The Software implements the following security measures:

- **Password Security**: All user passwords are hashed using the **bcrypt** algorithm before storage; plain-text passwords are never stored
- **Authentication**: Email login uses JWT (JSON Web Tokens) for secure authentication
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM prevent SQL injection attacks

### 7.2 Deployer Security Recommendations

We strongly recommend that all deployers:

- **Enable HTTPS/TLS**: Configure SSL certificates for the instance to encrypt data in transit
- **Regular Backups**: Perform regular database backups to prevent data loss
- **Access Control**: Properly configure database and Redis access controls
- **Timely Updates**: Keep software dependencies and security patches up to date

The specific level of data security depends on the security measures implemented by the deployer. Please consult the operator of the instance you are using for details on their security practices.

---

## 8. Children's Privacy

The Software is **not directed at children under the age of 13**. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and discover that your child has provided personal information to an instance, please contact the deployer of that instance to request deletion of the relevant data.

---

## 9. Policy Updates

This Privacy Policy may be updated from time to time. Updated policies will be posted on this page with the "Last Updated" date noted at the top. For material changes, deployers may choose to notify users through prominent means such as platform notifications or email.

Users are advised to review this Privacy Policy periodically to stay informed of the latest privacy protection practices.

---

## 10. Contact Information

### 10.1 Regarding the Developer

Weiwuweixin is an open-source software project (MIT License). The developers do not operate any official instance, nor do they directly collect user data. For questions about this Privacy Policy template or the software code, please contact us through:

- **GitHub**: The Issues page of this project's repository

### 10.2 Regarding the Instance Deployer

For data processing questions or requests to exercise your data rights concerning the specific instance you are using, **please contact the deployer/operator of that instance directly**. The deployer, as the Data Controller, bears legal responsibility for user data within the instance.

Deployers should display their contact information in an appropriate location on their instance (such as the website footer or "About" page).

---

> **Disclaimer**: This Privacy Policy is a template document. As Weiwuweixin is self-hosted open-source software, the deployer of each instance independently assumes the responsibilities of a Data Controller. The developers assume no responsibility for the data processing activities of any specific instance. Deployers may adjust this policy according to their actual circumstances and legal requirements.
