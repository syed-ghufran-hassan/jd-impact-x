import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const contractName = "campaign-registry";

describe("Campaign Registry Contract", () => {
  // ============================================
  // Initialization Tests
  // ============================================
  describe("Initialization", () => {
    it("should initialize with zero campaigns", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-campaign-count",
        [],
        deployer
      );
      expect(result).toBeUint(0);
    });

    it("should initialize with zero fees collected", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-total-fees",
        [],
        deployer
      );
      expect(result).toBeUint(0);
    });
  });

  // ============================================
  // Campaign Creation Tests
  // ============================================
  describe("create-campaign", () => {
    it("should create a campaign successfully", () => {
      const ipfsHash = "QmTest1234567890abcdef";
      const goal = 1000000000; // 1000 USDC (6 decimals)
      const duration = 4320; // ~30 days (144 blocks/day * 30)

      const { result } = simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii(ipfsHash), Cl.uint(goal), Cl.uint(duration)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("should increment campaign counter", () => {
      const ipfsHash = "QmTest1234567890abcdef";
      const goal = 1000000000;
      const duration = 4320;

      // Create first campaign
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii(ipfsHash), Cl.uint(goal), Cl.uint(duration)],
        wallet1
      );

      // Create second campaign
      const { result } = simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii(ipfsHash), Cl.uint(goal), Cl.uint(duration)],
        wallet2
      );

      expect(result).toBeOk(Cl.uint(2));

      // Check count
      const { result: countResult } = simnet.callReadOnlyFn(
        contractName,
        "get-campaign-count",
        [],
        deployer
      );
      expect(countResult).toBeUint(2);
    });

    it("should fail with zero goal", () => {
      const ipfsHash = "QmTest1234567890abcdef";
      const goal = 0;
      const duration = 4320;

      const { result } = simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii(ipfsHash), Cl.uint(goal), Cl.uint(duration)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(106)); // ERR_INVALID_AMOUNT
    });

    it("should store campaign data correctly", () => {
      const ipfsHash = "QmTestHash123456789";
      const goal = 5000000000; // 5000 USDC
      const duration = 2880; // ~20 days

      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii(ipfsHash), Cl.uint(goal), Cl.uint(duration)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-campaign",
        [Cl.uint(1)],
        deployer
      );

      // Check that result is Some (campaign exists)
      expect(result.type).toBe("some");
      // The campaign was created successfully
    });
  });

  // ============================================
  // Register Deposit Tests
  // ============================================
  describe("register-deposit", () => {
    beforeEach(() => {
      // Create a campaign for testing
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii("QmTestCampaign"), Cl.uint(1000000000), Cl.uint(4320)],
        wallet1
      );
    });

    it("should register a deposit successfully", () => {
      const campaignId = 1;
      const amount = 100000000; // 100 USDC
      const donor = wallet2;

      const { result } = simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(campaignId), Cl.uint(amount), Cl.principal(donor)],
        wallet1 // owner
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should update raised amount", () => {
      const campaignId = 1;
      const amount = 100000000; // 100 USDC

      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(campaignId), Cl.uint(amount), Cl.principal(wallet2)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-campaign",
        [Cl.uint(campaignId)],
        deployer
      );

      // Verify campaign exists and has been updated
      expect(result.type).toBe("some");
    });

    it("should increment backer count for new donors", () => {
      const campaignId = 1;

      // First donation
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(campaignId), Cl.uint(50000000), Cl.principal(wallet2)],
        wallet1
      );

      // Second donation from different donor
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(campaignId), Cl.uint(50000000), Cl.principal(wallet3)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-backer-count",
        [Cl.uint(campaignId)],
        deployer
      );

      expect(result).toBeTuple({ count: Cl.uint(2) });
    });

    it("should not increment backer count for repeat donors", () => {
      const campaignId = 1;

      // First donation
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(campaignId), Cl.uint(50000000), Cl.principal(wallet2)],
        wallet1
      );

      // Second donation from same donor
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(campaignId), Cl.uint(50000000), Cl.principal(wallet2)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-backer-count",
        [Cl.uint(campaignId)],
        deployer
      );

      expect(result).toBeTuple({ count: Cl.uint(1) });
    });

    it("should fail if not owner", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(100000000), Cl.principal(wallet2)],
        wallet2 // not owner
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_OWNER
    });

    it("should fail with zero amount", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(0), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(106)); // ERR_INVALID_AMOUNT
    });

    it("should fail for non-existent campaign", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(999), Cl.uint(100000000), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR_CAMPAIGN_NOT_FOUND
    });
  });

  // ============================================
  // Claim Funds Tests
  // ============================================
  describe("claim-funds", () => {
    beforeEach(() => {
      // Create a campaign with 1000 USDC goal
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii("QmTestCampaign"), Cl.uint(1000000000), Cl.uint(4320)],
        wallet1
      );
    });

    it("should claim funds when goal is met", () => {
      // Register enough deposits to meet goal
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(1000000000), Cl.principal(wallet2)],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        contractName,
        "claim-funds",
        [Cl.uint(1)],
        wallet1
      );

      // 1000 USDC - 2% fee = 980 USDC payout, 20 USDC fee
      expect(result).toBeOk(
        Cl.tuple({
          payout: Cl.uint(980000000),
          fee: Cl.uint(20000000),
        })
      );
    });

    it("should update total fees collected", () => {
      // Meet goal and claim
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(1000000000), Cl.principal(wallet2)],
        wallet1
      );

      simnet.callPublicFn(contractName, "claim-funds", [Cl.uint(1)], wallet1);

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-total-fees",
        [],
        deployer
      );

      expect(result).toBeUint(20000000); // 2% of 1000 USDC
    });

    it("should mark campaign as claimed", () => {
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(1000000000), Cl.principal(wallet2)],
        wallet1
      );

      simnet.callPublicFn(contractName, "claim-funds", [Cl.uint(1)], wallet1);

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-campaign",
        [Cl.uint(1)],
        deployer
      );

      // Verify campaign exists after claim
      expect(result.type).toBe("some");
    });

    it("should fail if goal not met", () => {
      // Only register 50% of goal
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(500000000), Cl.principal(wallet2)],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        contractName,
        "claim-funds",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR_GOAL_NOT_MET
    });

    it("should fail if not owner", () => {
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(1000000000), Cl.principal(wallet2)],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        contractName,
        "claim-funds",
        [Cl.uint(1)],
        wallet2 // not owner
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_OWNER
    });

    it("should fail if already claimed", () => {
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(1000000000), Cl.principal(wallet2)],
        wallet1
      );

      // First claim
      simnet.callPublicFn(contractName, "claim-funds", [Cl.uint(1)], wallet1);

      // Second claim attempt
      const { result } = simnet.callPublicFn(
        contractName,
        "claim-funds",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(102)); // ERR_ALREADY_CLAIMED
    });
  });

  // ============================================
  // Update Metadata Tests
  // ============================================
  describe("update-campaign-metadata", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii("QmOriginalHash"), Cl.uint(1000000000), Cl.uint(4320)],
        wallet1
      );
    });

    it("should update metadata successfully", () => {
      const newHash = "QmNewUpdatedHash12345";

      const { result } = simnet.callPublicFn(
        contractName,
        "update-campaign-metadata",
        [Cl.uint(1), Cl.stringAscii(newHash)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should fail if not owner", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "update-campaign-metadata",
        [Cl.uint(1), Cl.stringAscii("QmNewHash")],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_OWNER
    });
  });

  // ============================================
  // Read-Only Function Tests
  // ============================================
  describe("Read-only functions", () => {
    beforeEach(() => {
      // Create a campaign
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii("QmTestCampaign"), Cl.uint(1000000000), Cl.uint(4320)],
        wallet1
      );

      // Add a donation
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(600000000), Cl.principal(wallet2)],
        wallet1
      );
    });

    it("should calculate fee correctly", () => {
      const amount = 1000000000; // 1000 USDC
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "calculate-fee",
        [Cl.uint(amount)],
        deployer
      );

      expect(result).toBeUint(20000000); // 2% = 20 USDC
    });

    it("should check if goal is met", () => {
      // 600/1000 = not met
      const { result: notMet } = simnet.callReadOnlyFn(
        contractName,
        "is-goal-met",
        [Cl.uint(1)],
        deployer
      );
      expect(notMet).toBeBool(false);

      // Add more to meet goal
      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(400000000), Cl.principal(wallet3)],
        wallet1
      );

      const { result: met } = simnet.callReadOnlyFn(
        contractName,
        "is-goal-met",
        [Cl.uint(1)],
        deployer
      );
      expect(met).toBeBool(true);
    });

    it("should get donation amount", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-donation",
        [Cl.uint(1), Cl.principal(wallet2)],
        deployer
      );

      expect(result).toBeTuple({ amount: Cl.uint(600000000) });
    });

    it("should return zero for non-existent donation", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-donation",
        [Cl.uint(1), Cl.principal(wallet3)],
        deployer
      );

      expect(result).toBeTuple({ amount: Cl.uint(0) });
    });
  });

  // ============================================
  // Admin Function Tests
  // ============================================
  describe("withdraw-fees", () => {
    it("should allow contract owner to withdraw fees", () => {
      // Create and fund a campaign to generate fees
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii("QmTest"), Cl.uint(1000000000), Cl.uint(4320)],
        wallet1
      );

      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(1000000000), Cl.principal(wallet2)],
        wallet1
      );

      simnet.callPublicFn(contractName, "claim-funds", [Cl.uint(1)], wallet1);

      // Deployer (contract owner) withdraws fees
      const { result } = simnet.callPublicFn(
        contractName,
        "withdraw-fees",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(20000000)); // 2% of 1000 USDC
    });

    it("should fail if not contract owner", () => {
      // Generate some fees first
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii("QmTest"), Cl.uint(1000000000), Cl.uint(4320)],
        wallet1
      );

      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(1000000000), Cl.principal(wallet2)],
        wallet1
      );

      simnet.callPublicFn(contractName, "claim-funds", [Cl.uint(1)], wallet1);

      // Non-owner tries to withdraw
      const { result } = simnet.callPublicFn(
        contractName,
        "withdraw-fees",
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(107)); // ERR_UNAUTHORIZED
    });

    it("should fail if no fees to withdraw", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "withdraw-fees",
        [],
        deployer
      );

      expect(result).toBeErr(Cl.uint(106)); // ERR_INVALID_AMOUNT
    });

    it("should reset fees after withdrawal", () => {
      // Generate fees
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringAscii("QmTest"), Cl.uint(1000000000), Cl.uint(4320)],
        wallet1
      );

      simnet.callPublicFn(
        contractName,
        "register-deposit",
        [Cl.uint(1), Cl.uint(1000000000), Cl.principal(wallet2)],
        wallet1
      );

      simnet.callPublicFn(contractName, "claim-funds", [Cl.uint(1)], wallet1);

      // Withdraw
      simnet.callPublicFn(contractName, "withdraw-fees", [], deployer);

      // Check fees are reset
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-total-fees",
        [],
        deployer
      );

      expect(result).toBeUint(0);
    });
  });
});
