export type InfoBlockInput = {
  title: string;
  description: string;
  version: string;
  contactName: string;
  contactEmail: string;
  contactUrl: string;
};

export type InfoBlockOutput = {
  title: string;
  description: string;
  version: string;
  contact: {
    name: string;
    email: string;
    url: string;
  };
};
