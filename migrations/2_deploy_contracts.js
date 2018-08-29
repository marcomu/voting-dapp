var Consensus = artifacts.require('./Consensus.sol');

module.exports = function(deployer) {
	
	deployer.deploy(Consensus, 10000, ['Lopez', 'Anaya', 'Meade']);

};
