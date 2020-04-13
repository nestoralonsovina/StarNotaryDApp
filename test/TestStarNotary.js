const StarNotary = artifacts.require("StarNotary");

contract('StarNotary', async (accounts) => {

    // CONSTANTS
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    const owner = accounts[0];

    let instance;
    let user1, user2;

    // variables reseted before each test
    before(async () => {
        instance = await StarNotary.deployed();
        user1 = accounts[1];
        user2 = accounts[2];
    });

    it('can Create a Star', async () => {
        let tokenId = 1;
        await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
        assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
    });

    it('lets user1 put up their star for sale', async () => {
        let starId = 2;
        let starPrice = web3.utils.toWei(".01", "ether");
        await instance.createStar('awesome star', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });
        assert.equal(await instance.starsForSale.call(starId), starPrice);
    });

    it('lets user1 get the funds after the sale', async () => {
        let starId = 3;

        await instance.createStar('awesome star', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
        await instance.buyStar(starId, { from: user2, value: balance });
        let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
        let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
        let value2 = Number(balanceOfUser1AfterTransaction);
        assert.equal(value1, value2);
    });

    it('lets user2 buy a star, if it is put up for sale', async () => {
        let starId = 4;
        await instance.createStar('awesome star', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
        await instance.buyStar(starId, { from: user2, value: balance });
        assert.equal(await instance.ownerOf.call(starId), user2);
    });

    it('lets user2 buy a star and decreases its balance in ether', async () => {
        let starId = 5;
        await instance.createStar('awesome star', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
        const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
        await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
        const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
        let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
        assert.equal(value, starPrice);
    });

    it('can add the star name and star symbol properly', async () => {
        // 1. create a Star with different tokenId
        const starId = 123;
        await instance.createStar('star1', starId, { from: user1 });
        //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        assert.equal(await instance.name.call(), 'NA_STAR_COIN');
        assert.equal(await instance.symbol.call(), 'NA_STAR');
    });

    it('lets 2 users exchange stars', async () => {
        // 1. create 2 Stars with different tokenId
        const tokenId1 = 123456;
        await instance.createStar('star1', tokenId1, { from: user1 });
        assert.equal(await instance.ownerOf(tokenId1), user1);

        const tokenId2 = 1234567;
        await instance.createStar('star2', tokenId2, { from: user2 });
        assert.equal(await instance.ownerOf(tokenId2), user2);

        // 2. Call the exchangeStars functions implemented in the Smart Contract
        await instance.exchangeStars(tokenId1, tokenId2, { from: user1 });

        // 3. Verify that the owners changed
        assert.equal(await instance.ownerOf(tokenId1), user2);
        assert.equal(await instance.ownerOf(tokenId2), user1);
    });

    it('lets a user transfer a star', async () => {
        // 1. create a Star with different tokenId
        const starId = 12345;
        await instance.createStar('star1', starId, { from: user1 });

        // 2. use the transferStar function implemented in the Smart Contract
        await instance.transferStar(user2, starId, { from: user1 });
        // 3. Verify the star owner changed.
        const owner = await instance.ownerOf(starId);

        assert.equal(owner, user2);
    });

    it('lookUptokenIdToStarInfo test', async () => {
        // 1. create a Star with different tokenId
        const starId = 1234;
        await instance.createStar('star1', starId, { from: user1 });
        // 2. Call your method lookUptokenIdToStarInfo
        const starName = await instance.lookUptokenIdToStarInfo.call(starId);
        // 3. Verify if you Star name is the same
        assert.equal(starName, 'star1');
    });
});

