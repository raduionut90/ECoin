const ECoin = artifacts.require("ECoin");

contract("ECoin", (accounts) => {
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    beforeEach(async () => {
        // Deploy the ECoin contract before each test case
        this.eCoinInstance = await ECoin.new(1000000, { from: owner });
    });

    it("should deploy the contract and mint initial supply", async () => {
        const totalSupply = 1000000;

        const balance = await this.eCoinInstance.balanceOf(owner);

        assert.equal(balance.toNumber(), totalSupply, "Invalid initial supply");
    });

    it("should transfer tokens between accounts", async () => {
        const amountToTransfer = 100;

        const balanceBeforeTransfer = await this.eCoinInstance.balanceOf(user1);
        await this.eCoinInstance.transfer(user1, amountToTransfer, { from: owner });
        const balanceAfterTransfer = await this.eCoinInstance.balanceOf(user1);

        assert.equal(
            balanceAfterTransfer.toNumber(),
            balanceBeforeTransfer.toNumber() + amountToTransfer,
            "Invalid transfer"
        );
    });

    it("should prevent transfer to blacklisted address", async () => {
        const blacklistedAddress = user2;

        await this.eCoinInstance.blacklist(blacklistedAddress, true, { from: owner });

        try {
            await this.eCoinInstance.transfer(blacklistedAddress, 10, { from: owner });
            assert.fail("Transfer should have failed");
        } catch (error) {
            assert.include(
                error.message.toLowerCase(),
                "blacklisted",
                "Unexpected error message"
            );
        }
    });

    it("should prevent transfer from blacklisted address", async () => {
        const blacklistedAddress = user1;

        await this.eCoinInstance.blacklist(blacklistedAddress, true, { from: owner });

        try {
            await this.eCoinInstance.transfer(user2, 10, { from: blacklistedAddress });
            assert.fail("Transfer should have failed");
        } catch (error) {
            assert.include(
                error.message.toLowerCase(),
                "blacklisted",
                "Unexpected error message"
            );
        }
    });

    it("should prevent transfer exceeding the maxHoldingAmount", async () => {
        const maxHoldingAmount = 1000;
        const minHoldingAmount = 0;

        await this.eCoinInstance.setRule(true, owner, maxHoldingAmount, minHoldingAmount, {
            from: owner,
        });

        const initialBalance = await this.eCoinInstance.balanceOf(user1);

        try {
            // Transfer tokens to user1 exceeding the maxHoldingAmount
            await this.eCoinInstance.transfer(user1, maxHoldingAmount + 1, {
                from: owner,
            });
            assert.fail("Transfer should have failed");
        } catch (error) {
            assert.include(
                error.message.toLowerCase(),
                "forbid",
                "Unexpected error message"
            );
        }

        // Verify the balance remains unchanged
        const finalBalance = await this.eCoinInstance.balanceOf(user1);
        assert.equal(
            finalBalance.toNumber(),
            initialBalance.toNumber(),
            "Unexpected balance change"
        );
    });
});
