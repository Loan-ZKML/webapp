// TODO fix the applicant data we actually feed in to the model + 
// Credit applicant data structure
export interface CreditApplicant {
    name: string;
    income: number;
    employmentYears: number;
    existingLoans: number;
    creditScore?: number;
    requestedAmount: number;
    purpose: string;
  }
  
  // TODO see over fields and their relevance
  // Generated proof structure
  export interface ZKMLProof {
    id: string;
    applicantHash: string; // hash of the applicant data
    modelVersion: string;
    timestamp: number;
    proofData: string; // base64 encoded proof data
  }
  
  // TODO see over fields and their relevance
  // Verification result structure
  export interface VerificationResult {
    success: boolean;
    message: string;
    loanApproved?: boolean;
    loanAmount?: number;
    interestRate?: number;
    termMonths?: number;
  }
  
//   // Mock API service for ZKML operations
//   export interface ZKMLService {
//     generateProof: (applicant: CreditApplicant) => Promise<ZKMLProof>;
//     verifyProof: (proofId: string) => Promise<VerificationResult>;
//   }
  
//   // Mock implementation of the ZKML service
//   export class MockZKMLService implements ZKMLService {
//     // Generate a proof based on applicant data
//     async generateProof(applicant: CreditApplicant): Promise<ZKMLProof> {
//       // Simulate processing time
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Create hash of applicant data (simplified for demo)
//       const applicantString = JSON.stringify(applicant);
//       const applicantHash = btoa(applicantString).substring(0, 20);
      
//       // Generate random proof ID
//       const proofId = 'zkp_' + Math.random().toString(36).substring(2, 10);
      
//       return {
//         id: proofId,
//         applicantHash,
//         modelVersion: 'credit-model-v1.0',
//         timestamp: Date.now(),
//         proofData: btoa(Math.random().toString(36) + applicantString) // Demo proof
//       };
//     }
    
//     // Verify a proof
//     async verifyProof(proofId: string): Promise<VerificationResult> {
//       // Simulate verification time
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // For demo, randomly approve or reject loans
//       const approved = Math.random() > 0.2; // 80% approval rate for demo
      
//       return {
//         success: true,
//         message: approved 
//           ? 'Proof verified successfully. Loan terms generated.' 
//           : 'Proof verified, but loan not approved based on credit assessment.',
//         loanApproved: approved,
//         loanAmount: approved ? Math.round(Math.random() * 15000 + 5000) : undefined,
//         interestRate: approved ? parseFloat((Math.random() * 6 + 4).toFixed(2)) : undefined,
//         termMonths: approved ? [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)] : undefined
//       };
//     }
//   }