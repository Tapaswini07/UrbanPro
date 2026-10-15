const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const lines = code.split('\n');

const newCardsCode = `                  {/* Survey Cards */}
                  <div className="space-y-6 flex justify-center flex-col items-center">
                    {surveys.map((survey) => (
                      <div key={survey.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-3xl">
                        {/* Card Header (Tags) */}
                        <div className="flex justify-between items-start">
                          <div className="bg-[#ff9933] text-white px-4 py-1.5 rounded-br-lg text-sm font-medium shadow-sm">
                            {survey.surveyDate || 'N/A'}
                          </div>
                          <div className="bg-[#333366] text-white px-4 py-1.5 rounded-bl-lg text-sm font-medium shadow-sm">
                            SURVEY No. - #{survey.surveyNo || survey.id}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#333366] flex items-center justify-center text-white shrink-0 shadow-sm">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="text-blue-600 font-medium">{survey.partyName || 'N/A'}</span>
                            </div>

                            <div className="relative pl-4 space-y-6 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-300">
                              <div className="relative flex items-start gap-3">
                                <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-[#333366] flex items-center justify-center text-white ring-4 ring-white z-10 shadow-sm">
                                  <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <div className="pl-2">
                                  <p className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">From</p>
                                  <p className="font-medium text-slate-800 text-sm">{survey.fromCity || 'N/A'}</p>
                                </div>
                              </div>
                              
                              <div className="relative flex items-start gap-3">
                                <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-[#333366] flex items-center justify-center text-white ring-4 ring-white z-10 shadow-sm">
                                  <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <div className="pl-2">
                                  <p className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">To</p>
                                  <p className="font-medium text-slate-800 text-sm min-h-[20px]">{survey.toCity || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-8 pt-2">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#333366] flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Box className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">Total Items</p>
                                <p className="font-medium text-slate-800 text-sm">{survey.items?.length || 0}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Phone className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">Click to call</p>
                                <a href={\`tel:\${survey.mobileNo}\`} className="font-medium text-blue-600 text-sm hover:underline">{survey.mobileNo || 'N/A'}</a>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="border-t border-slate-100 p-4 flex justify-center gap-6 bg-slate-50/50">
                          <button onClick={() => setViewingSurvey(survey)} className="flex flex-col items-center gap-1.5 group">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">View</span>
                          </button>
                          
                          <button onClick={() => handleShareSurvey(survey)} className="flex flex-col items-center gap-1.5 group">
                            <div className="w-10 h-10 rounded-full border-2 border-green-400 bg-white flex items-center justify-center text-green-500 shadow-sm group-hover:bg-green-50 transition-colors">
                              <Share2 className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-green-500 uppercase tracking-wide">Share</span>
                          </button>
                          
                          <button onClick={() => handleEditSurvey(survey)} className="flex flex-col items-center gap-1.5 group">
                            <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-white flex items-center justify-center text-cyan-500 shadow-sm group-hover:bg-cyan-50 transition-colors">
                              <Edit className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-cyan-500 uppercase tracking-wide">Edit</span>
                          </button>
                          
                          <button onClick={() => handleDeleteSurvey(survey.id)} className="flex flex-col items-center gap-1.5 group">
                            <div className="w-10 h-10 rounded-full border-2 border-red-300 bg-white flex items-center justify-center text-red-400 shadow-sm group-hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>`;

// Replace lines 624-726
lines.splice(623, 726 - 624 + 1, newCardsCode);

fs.writeFileSync('src/App.tsx', lines.join('\n'));
