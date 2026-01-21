# Product Requirements Document (PRD): Impact-X

| Project | Impact-X |
| :--- | :--- |
| **Type** | Crowdfunding / Escrow Platform |
| **Core Tech** | Circle xReserve, Clarity Smart Contracts |
| **Status** | **Ready for Build** |

---

## 1. Product Overview
Impact-X allows users to create fundraising campaigns on Stacks that can accept deposits from Ethereum. It utilizes a Clarity smart contract to hold funds in escrow.

## 2. User Personas
1.  **The Creator (Stacks):** Needs capital. Wants to reach the widest possible audience (Eth holders).
2.  **The Backer (Ethereum):** Wants to support a cause/project but doesn't want to figure out how to bridge to Stacks manually.

---

## 3. Functional Requirements (FR)

### Module 1: The Campaign Factory (Stacks Side)
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Create Campaign** | User inputs: Title, Description, Goal Amount (USDCx), Deadline. | P0 |
| **FR-02** | **Smart Contract Storage** | Data is stored in a Clarity Map: `(define-map Campaigns { id: uint } { owner: principal, goal: uint, raised: uint, claimed: bool })`. | P0 |
| **FR-03** | **Campaign Page** | Display progress bar (Raised vs Goal). | P0 |

### Module 2: The Cross-Chain Donation (Eth Side)
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-04** | **Donate Button** | Connect MetaMask. Input Amount. | P0 |
| **FR-05** | **Address Encoding** | **Critical:** The bridge destination must be the **Impact-X Smart Contract Address**, NOT the Campaign Owner's address. | P0 |
| **FR-06** | **Memo/Tagging** | We must know *which* campaign the money is for. <br>**Tech Hack:** Since Circle `depositForBurn` doesn't easily pass arbitrary string memos to Stacks, we will track the donation via an off-chain indexer (or local storage mapping TxHash -> CampaignID) for the MVP. | P0 |

### Module 3: The Escrow & Claim (Clarity)
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-07** | **Holding Funds** | The Contract implements the `SIP-010` receiver trait (or simply holds the balance). | P0 |
| **FR-08** | **Claim Funds** | If `campaign.raised >= campaign.goal`, Owner can call `claim()`. Contract transfers USDCx to Owner. | P1 |
| **FR-09** | **Refunds (Optional)** | If `block-height > deadline` and `raised < goal`, donors can withdraw. *(For Hackathon, we can skip this complexity and just allow Owner to withdraw whatever was raised).* | P2 |

---

## 4. Technical Architecture

### The "Memo" Challenge & Solution
*   *Problem:* When USDCx arrives at the contract, the contract doesn't inherently know it was for "Campaign #5".
*   *Hackathon Solution:*
    1.  **Shared Wallet Mode:** Instead of a complex contract for the MVP, we generate a **Unique Stacks Address** (derived from the user's wallet) for each campaign.
    2.  *Better Solution (Contract):* The User donates. The Frontend watches the bridge. When the funds arrive in the Contract, the **Creator** calls a `register-deposit` function to assign those funds to their campaign (optimistic UI).

### Recommended Simplified Flow (for 5-day build)
To avoid writing complex Clarity "Listening" logic:
1.  **Donation:** Eth User bridges to the **Creator's Wallet directly**.
2.  **Tracking:** The UI tracks this bridge transaction.
3.  **Display:** The UI updates the "Raised" bar based on the *bridge event*, even if the funds sit in the User's wallet.
4.  *Why:* This mimics crowdfunding UX without the risk of getting funds stuck in a contract you wrote in 2 days.

*However, to win "Technical Innovation", try to send to a contract if you can.*

---

## 5. UI Flow
1.  **Home:** "Trending Campaigns".
2.  **Create:** Form -> Deploys a new "Campaign Card" (stored in a JSON/IPFS or simple Clarity map).
3.  **Donate:**
    *   Backer selects "Campaign A".
    *   Clicks "Back with 50 USDC".
    *   Signs Eth Tx.
    *   **UI Update:** "Thanks for backing! Funds are bridging..."
4.  **Success:** Progress bar increases.

---

## 6. Development Strategy
*   **Reuse:** Copy the **Eth Bridge Component** from your "Settler" project.
*   **Modify:** Change the `recipient` from "User Input" to "Campaign Owner Address".
*   **Focus:** Spend your time on the **"Campaign Page" UI** (Progress bars, photos, stories) to make it look distinct from Settler.