## Project Overview

Goal: Build a simple "Learn-to-Earn" system that allows Sonic University (administrator) to reward tokens to students after verifying they have completed a course module.

Structure:
- Two Solidity contracts:
    1. `SonicEduToken.sol` (ERC20, Ownable) — the owner can mint tokens.
    2. `CourseCompletionTracker.sol` (Ownable) — stores the token address, manages course registration, tracks completion, and allows students to claim rewards.
- Unit tests.
- Interaction script (`scripts/interact.ts`) simulating the workflow: deploy, mint to tracker, addCourse, markCompletion, claimReward.
- Deployment script (`scripts/deploy.ts`) for testnet deployment.

## Usage

### 1. Clone the repository

```shell
git clone https://github.com/trongldwork/SonicEdu.git
cd SonicEdu
```

### 2. Install dependencies

```shell
npm install
```

### 3. Build the contracts

```shell
npx hardhat build
```

### Running Interaction Script

To simulate the workflow (deploy contracts, mint tokens, register courses, mark completion, and claim rewards), run the interaction script:

```shell
npx hardhat run scripts/interact.ts
```

This script will:
- Deploy both contracts to your local Hardhat network.
- Mint tokens to the `CourseCompletionTracker`.
- Register a sample course.
- Mark a student's completion.
- Allow the student to claim their reward tokens.
- Student claim their reward.

Check the script output for step-by-step results and any errors.


### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```


### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.



To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy ignition/modules/TokenTracker.ts --network sepolia --verify
```

After sucessful deployment, you can run deploy.ts to see result in the Sepolia network:

```shell
hardhat run scripts/deploy.ts --network sepolia
```