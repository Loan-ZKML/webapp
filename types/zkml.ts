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
  
