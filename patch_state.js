const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `  // Survey Form State
  const [surveyItems, setSurveyItems] = useState<{name: string, qty: string, value: string, remark: string}[]>([]);
  const [currentItem, setCurrentItem] = useState({name: '', qty: '1', value: '', remark: ''});
  const [surveyDate, setSurveyDate] = useState('');

  const addItemToSurvey = () => {
    if (currentItem.name.trim()) {
      setSurveyItems([currentItem, ...surveyItems]);
      setCurrentItem({name: '', qty: '1', value: '', remark: ''});
    }
  };

  const removeItemFromSurvey = (index: number) => {
    setSurveyItems(surveyItems.filter((_, i) => i !== index));
  };

  // Mock survey data for "All Survey List"
  const mockSurveys = [
    {
      id: 1,
      date: "2026-09-16",
      partyName: "ravi",
      from: "bs",
      to: "",
      itemsCount: 2,
      phone: "86766697676"
    }
  ];`;

const newState = `  // Survey State
  const initialSurveyForm = {
    id: Date.now(),
    surveyNo: '',
    surveyDate: '',
    partyName: '',
    mobileNo: '',
    email: '',
    packingDate: '',
    dateOfDelivery: '',
    fromCountry: '',
    fromState: '',
    fromCity: '',
    fromArea: '',
    fromPinCode: '',
    fromFloor: 'Ground',
    fromLift: 'Not Required',
    toCountry: '',
    toState: '',
    toCity: '',
    toArea: '',
    toPinCode: '',
    toFloor: 'Ground',
    toLift: 'Not Required',
    items: [] as {name: string, qty: string, value: string, remark: string}[],
    advancePay: '',
    easyAccess: '',
    balconyItems: '',
    extraInfo: ''
  };

  const [surveyForm, setSurveyForm] = useState(initialSurveyForm);
  const [surveys, setSurveys] = useState<any[]>([
    {
      id: 1,
      surveyNo: '1',
      surveyDate: "2026-09-16",
      partyName: "ravi",
      mobileNo: "86766697676",
      fromCity: "bs",
      toCity: "",
      items: [{ name: 'tv', qty: '1', value: '0', remark: '' }, { name: 'ws', qty: '1', value: '0', remark: '' }]
    }
  ]);
  
  const [currentItem, setCurrentItem] = useState({name: '', qty: '1', value: '', remark: ''});
  const [editingSurveyId, setEditingSurveyId] = useState<number | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<any | null>(null);

  const addItemToSurvey = () => {
    if (currentItem.name.trim()) {
      setSurveyForm({ ...surveyForm, items: [currentItem, ...surveyForm.items] });
      setCurrentItem({name: '', qty: '1', value: '', remark: ''});
    }
  };

  const removeItemFromSurvey = (index: number) => {
    setSurveyForm({ ...surveyForm, items: surveyForm.items.filter((_, i) => i !== index) });
  };
  
  const handleSaveSurvey = () => {
    if (editingSurveyId) {
      setSurveys(surveys.map(s => s.id === editingSurveyId ? surveyForm : s));
    } else {
      setSurveys([surveyForm, ...surveys]);
    }
    setSurveyForm({ ...initialSurveyForm, id: Date.now() });
    setEditingSurveyId(null);
    setAdminTab('list-survey');
  };

  const handleEditSurvey = (survey: any) => {
    setSurveyForm(survey);
    setEditingSurveyId(survey.id);
    setAdminTab('add-survey');
  };

  const handleDeleteSurvey = (id: number) => {
    setSurveys(surveys.filter(s => s.id !== id));
  };
  
  const handleShareSurvey = (survey: any) => {
    if (navigator.share) {
      navigator.share({
        title: \`Survey \${survey.surveyNo}\`,
        text: \`Survey Details for \${survey.partyName}\`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };`;

code = code.replace(oldState, newState);
fs.writeFileSync('src/App.tsx', code);
