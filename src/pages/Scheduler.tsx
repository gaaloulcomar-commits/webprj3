const updateEmail = (index: number, value: string) => {
  setFormData(prev => ({
    ...prev,
    notificationEmails: prev.notificationEmails.map((email, i) => 
      i === index ? value : email
    )
  }));
};

const updatePhone = (index: number, value: string) => {
  setFormData(prev => ({
    ...prev,
    notificationPhones: prev.notificationPhones.map((phone, i) => 
      i === index ? value : phone
    )
  }));
};