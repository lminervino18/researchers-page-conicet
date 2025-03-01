export interface Research {
    id: number;
    researchAbstract: string;
    mimeType: string;
    pdfSize: number;
    pdfName: string;
    pdfPath: string;
    createdAt: string;
    authors: string[];
    links: string[];
  }
  
  export interface Section {
    id: string;
    title: string;
    ref: React.RefObject<HTMLElement>;
  }

  // DTO para crear/actualizar una investigación (lo que enviamos al backend)
    export interface ResearchDTO {
      researchAbstract: string;
      authors: string[];
      links: string[];
    }