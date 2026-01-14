// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { 
//   Card, 
//   CardContent, 
//   CardDescription, 
//   CardHeader, 
//   CardTitle 
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Mail, 
//   Send, 
//   CheckCircle, 
//   Clock, 
//   AlertCircle, 
//   Upload,
//   Save,
//   FolderOpen,
//   Trash2,
//   Bold,
//   Italic,
//   Underline,
//   AlignLeft,
//   AlignCenter,
//   AlignRight,
//   List,
//   ListOrdered,
//   Link,
//   Image,
//   Type
// } from 'lucide-react';

// interface FreightQuery {
//   origin: string;
//   destination: string;
//   cargoType: string;
//   weight: string;
//   dimensions: string;
//   pickupDate: string;
//   deliveryDate: string;
//   specialRequirements: string;
// }

// interface EmailStatus {
//   id: string;
//   agentName: string;
//   email: string;
//   ccemail: string;
//   status: 'pending' | 'sent' | 'delivered' | 'opened' | 'replied' | 'failed' | 'waiting';
//   sentAt?: string;
//   openedAt?: string;
//   repliedAt?: string;
//   waitingFor?: number;
// }

// interface EmailTemplate {
//   id: string;
//   name: string;
//   subject: string;
//   htmlContent: string;
//   createdAt: string;
// }

// interface EmailConfirmationProps {
//   recipients?: Array<{ id: string; name: string; email: string; ccemail: string }>;
// }

// export default function EmailConfirmation({ recipients }: EmailConfirmationProps) {
//   // Freight Query State
//   const [freightQuery, setFreightQuery] = useState<FreightQuery>({
//     origin: '',
//     destination: '',
//     cargoType: '',
//     weight: '',
//     dimensions: '',
//     pickupDate: '',
//     deliveryDate: '',
//     specialRequirements: ''
//   });

//   // Email template & subject
//   const [emailSubject, setEmailSubject] = useState('Freight Quote Request - Urgent');
//   const [htmlContent, setHtmlContent] = useState('');
//   const editorRef = useRef<HTMLDivElement>(null);

//   // Template management
//   const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);
//   const [currentTemplateName, setCurrentTemplateName] = useState('');
//   const [showTemplateManager, setShowTemplateManager] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Email statuses and sending state
//   const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
//   const [isSending, setIsSending] = useState(false);
//   const [currentSendingIndex, setCurrentSendingIndex] = useState<number | null>(null);
//   const [delaySeconds, setDelaySeconds] = useState(15);

//   // Base URL for images
//   const [imageBaseUrl, setImageBaseUrl] = useState('');

//   // Load templates from database on mount
//   useEffect(() => {
//     fetch('/api/email-templates')
//       .then(res => res.json())
//       .then(data => {
//         if (Array.isArray(data)) {
//           setSavedTemplates(data);
//         }
//       })
//       .catch(err => console.error('Failed to load templates:', err));
//   }, []);

//   // Load initial recipients
//   useEffect(() => {
//     fetch('/api/email-status')
//       .then(res => res.json())
//       .then(data => {
//         if (Array.isArray(recipients) && recipients.length > 0) {
//           const mapped = recipients.map(r => ({
//             id: r.id,
//             agentName: r.name,
//             email: r.email,
//             ccemail: r.ccemail,
//             status: 'pending' as const,
//           }));
//           setEmailStatuses(mapped);
//         } else if (Array.isArray(data) && data.length > 0) {
//           setEmailStatuses(data);
//         } else {
//           fetch('/api/agents')
//             .then(res => res.json())
//             .then((agents) => {
//               const seeded: EmailStatus[] = agents.map((a: any) => ({
//                 id: a.id,
//                 agentName: a.name,
//                 email: a.email,
//                 status: 'pending'
//               }));
//               setEmailStatuses(seeded);
//             })
//             .catch(err => console.error('Failed to fetch agents:', err));
//         }
//       })
//       .catch(err => console.error('[EmailConfirmation] Failed to fetch email statuses:', err));
//   }, [recipients]);

//   // Initialize base URL on mount
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setImageBaseUrl(window.location.origin);
//     }
//   }, []);

//   // Initialize editor with default content
//   useEffect(() => {
//     if (editorRef.current && !htmlContent) {
//       const defaultContent = `<p>Dear <strong>[Agent Name]</strong>,</p>
// <p><br></p>
// <p>We have a freight shipment opportunity that matches your service area and capabilities. Please review the details below:</p>
// <p><br></p>
// <p><strong>Shipment Details:</strong></p>
// <ul>
//   <li><strong>Origin:</strong> [Origin]</li>
//   <li><strong>Destination:</strong> [Destination]</li>
//   <li><strong>Cargo Type:</strong> [Cargo Type]</li>
//   <li><strong>Weight:</strong> [Weight]</li>
//   <li><strong>Dimensions:</strong> [Dimensions]</li>
//   <li><strong>Pickup Date:</strong> [Pickup Date]</li>
//   <li><strong>Delivery Date:</strong> [Delivery Date]</li>
// </ul>
// <p><br></p>
// <p>We're looking for competitive rates and reliable service. Please provide your best quote at your earliest convenience.</p>
// <p><br></p>
// <p>Best regards,<br><strong>Acumen Freight Solutions</strong></p>
// <p>Email: <a href="mailto:networkdesk@acumenfreight.org">networkdesk@acumenfreight.org</a></p>
// <p>LinkedIn: <a href="https://www.linkedin.com/company/acumen-freight-solutions/">Acumen Freight Solutions</a></p>`;
      
//       editorRef.current.innerHTML = defaultContent;
//       setHtmlContent(defaultContent);
//     }
//   }, []);

//   // Gmail-like formatting functions
//   const execCommand = (command: string, value?: string) => {
//     document.execCommand(command, false, value);
//     editorRef.current?.focus();
//   };

//   const insertLink = () => {
//     const url = prompt('Enter URL:');
//     if (url) {
//       execCommand('createLink', url);
//     }
//   };

//   const insertPlaceholder = (placeholder: string) => {
//     const selection = window.getSelection();
//     if (selection && selection.rangeCount > 0) {
//       const range = selection.getRangeAt(0);
//       range.deleteContents();
//       const span = document.createElement('span');
//       span.textContent = `[${placeholder}]`;
//       span.style.backgroundColor = '#e0e7ff';
//       span.style.padding = '2px 6px';
//       span.style.borderRadius = '3px';
//       span.style.fontWeight = '500';
//       range.insertNode(span);
//       range.setStartAfter(span);
//       range.setEndAfter(span);
//       selection.removeAllRanges();
//       selection.addRange(range);
//     }
//     editorRef.current?.focus();
//   };

//   // Image upload handler with API upload
//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       alert('Image size must be less than 5MB for email compatibility');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       const response = await fetch('/api/upload-image', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Upload failed');
//       }

//       const data = await response.json();
      
//       const fullImageUrl = data.url.startsWith('http') 
//         ? data.url 
//         : `${imageBaseUrl}${data.url}`;

//       const img = document.createElement('img');
//       img.src = fullImageUrl;
//       img.style.maxWidth = '100%';
//       img.style.height = 'auto';
//       img.style.display = 'block';
//       img.style.margin = '10px 0';

//       const selection = window.getSelection();
//       if (selection && selection.rangeCount > 0) {
//         const range = selection.getRangeAt(0);
//         range.insertNode(img);
//         range.setStartAfter(img);
//         range.collapse(true);
//         selection.removeAllRanges();
//         selection.addRange(range);
//       } else if (editorRef.current) {
//         editorRef.current.appendChild(img);
//       }

//       if (editorRef.current) {
//         setHtmlContent(editorRef.current.innerHTML);
//       }

//       alert('Image uploaded successfully!');
//     } catch (error) {
//       console.error('Image upload failed:', error);
//       alert('Failed to upload image. Please try again or use an external image URL.');
//     }
//   };

//   // Template management
//   const saveTemplate = async () => {
//     if (!currentTemplateName.trim()) {
//       alert('Please enter a template name');
//       return;
//     }

//     const content = editorRef.current?.innerHTML || '';

//     try {
//       const response = await fetch('/api/email-templates', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: currentTemplateName,
//           subject: emailSubject,
//           htmlContent: content
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save template');
//       }

//       const newTemplate = await response.json();
//       setSavedTemplates(prev => [newTemplate, ...prev]);
//       setCurrentTemplateName('');
//       alert('Template saved successfully!');
//     } catch (error) {
//       console.error('Failed to save template:', error);
//       alert('Failed to save template. Please try again.');
//     }
//   };

//   const loadTemplate = (template: EmailTemplate) => {
//     setEmailSubject(template.subject);
//     if (editorRef.current) {
//       editorRef.current.innerHTML = template.htmlContent;
//       setHtmlContent(template.htmlContent);
//     }
//     setShowTemplateManager(false);
//   };

//   const deleteTemplate = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this template?')) return;
    
//     try {
//       const response = await fetch('/api/email-templates', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete template');
//       }

//       setSavedTemplates(prev => prev.filter(t => t.id !== id));
//     } catch (error) {
//       console.error('Failed to delete template:', error);
//       alert('Failed to delete template. Please try again.');
//     }
//   };

//   // Personalize HTML content
//   const personalizeContent = (html: string, agent: EmailStatus) => {
//     return html
//       .replace(/\[Agent Name\]/g, agent.agentName)
//       .replace(/\[Origin\]/g, freightQuery.origin)
//       .replace(/\[Destination\]/g, freightQuery.destination)
//       .replace(/\[Cargo Type\]/g, freightQuery.cargoType)
//       .replace(/\[Weight\]/g, freightQuery.weight)
//       .replace(/\[Dimensions\]/g, freightQuery.dimensions)
//       .replace(/\[Pickup Date\]/g, freightQuery.pickupDate)
//       .replace(/\[Delivery Date\]/g, freightQuery.deliveryDate);
//   };

//   // Queue-based email sending
//   const handleSendEmailsWithQueue = () => {
//     const content = editorRef.current?.innerHTML || '';
    
//     setIsSending(true);
//     console.log('Starting queued email campaign at:', new Date().toISOString());
    
//     const sendNextEmail = (index: number) => {
//       if (index >= emailStatuses.length) {
//         setIsSending(false);
//         setCurrentSendingIndex(null);
//         console.log('All emails sent at:', new Date().toISOString());
//         return;
//       }

//       setCurrentSendingIndex(index);
//       const current = emailStatuses[index];
//       console.log(`Sending queued email ${index + 1}/${emailStatuses.length} to ${current.email}`);

//       const personalizedHtml = personalizeContent(content, current);
//       const emailStartTime = Date.now();

//       fetch('/api/send-email', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           to: current.email,
//           cc: current.ccemail,
//           subject: emailSubject,
//           html: personalizedHtml
//         })
//       })
//       .then(res => {
//         const emailDuration = Date.now() - emailStartTime;
//         console.log(`Email API call ${index + 1} took ${emailDuration}ms`);
        
//         if (!res.ok) {
//           return res.text().then(text => {
//             throw new Error(`HTTP ${res.status}: ${text}`);
//           });
//         }
//         return res.json();
//       })
//       .then(() => {
//         setEmailStatuses(prev => prev.map((status, idx) => 
//           idx === index 
//             ? { ...status, status: 'sent', sentAt: new Date().toLocaleString() }
//             : status
//         ));
        
//         console.log(`Queued email ${index + 1} sent successfully to ${current.email}`);
//       })
//       .catch(err => {
//         console.error(`Queued email ${index + 1} failed to ${current.email}:`, err);
//         setEmailStatuses(prev => prev.map((status, idx) => 
//           idx === index 
//             ? { ...status, status: 'failed' }
//             : status
//         ));
//       })
//       .finally(() => {
//         if (index < emailStatuses.length - 1) {
//           const delayMs = delaySeconds * 1000;
//           console.log(`Scheduling next email in ${delaySeconds} seconds...`);
          
//           setCurrentSendingIndex(null);
//           let remainingSeconds = delaySeconds;
          
//           const countdownInterval = setInterval(() => {
//             remainingSeconds--;
//             setEmailStatuses(prev => prev.map((status, idx) => 
//               idx === index + 1 
//                 ? { ...status, status: 'waiting', waitingFor: remainingSeconds }
//                 : status
//             ));
            
//             if (remainingSeconds <= 0) {
//               clearInterval(countdownInterval);
//               setEmailStatuses(prev => prev.map((status, idx) => 
//                 idx === index + 1 
//                   ? { ...status, status: 'pending', waitingFor: undefined }
//                   : status
//               ));
//             }
//           }, 1000);
          
//           setTimeout(() => {
//             clearInterval(countdownInterval);
//             sendNextEmail(index + 1);
//           }, delayMs);
//         } else {
//           setIsSending(false);
//           setCurrentSendingIndex(null);
//         }
//       });
//     };

//     sendNextEmail(0);
//   };

//   // Status UI helpers
//   const getStatusIcon = (status: EmailStatus['status']) => {
//     switch (status) {
//       case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
//       case 'waiting': return <Clock className="h-4 w-4 text-orange-600 animate-pulse" />;
//       case 'sent': return <Send className="h-4 w-4 text-blue-600" />;
//       case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
//       case 'opened': return <Mail className="h-4 w-4 text-indigo-600" />;
//       case 'replied': return <CheckCircle className="h-4 w-4 text-green-700" />;
//       case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
//       default: return <Clock className="h-4 w-4 text-gray-400" />;
//     }
//   };

//   const getStatusBadge = (status: EmailStatus['status'], waitingFor?: number) => {
//     const colors = {
//       pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       waiting: 'bg-orange-100 text-orange-800 border-orange-200',
//       sent: 'bg-blue-100 text-blue-800 border-blue-200',
//       delivered: 'bg-green-100 text-green-800 border-green-200',
//       opened: 'bg-indigo-100 text-indigo-800 border-indigo-200',
//       replied: 'bg-green-100 text-green-900 border-green-300',
//       failed: 'bg-red-100 text-red-800 border-red-200'
//     };
    
//     const displayStatus = status === 'waiting' && waitingFor ? `waiting (${waitingFor}s)` : status;
//     return <Badge className={colors[status]} variant="outline">{displayStatus}</Badge>;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Email Campaign Management</h2>
//           <p className="text-gray-600">Create professional emails and track responses</p>
//         </div>
//         <div className="flex gap-3">
//           <Badge variant="secondary">{emailStatuses.length} Recipients</Badge>
//           <Badge className="bg-green-100 text-green-800">
//             {emailStatuses.filter(s => s.status === 'replied').length} Replies
//           </Badge>
//         </div>
//       </div>

//       {/* Gmail-Style Email Composer */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <Mail className="h-5 w-5" /> Compose Email
//               </CardTitle>
//               <CardDescription>Write your email message with rich formatting</CardDescription>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* Subject Line */}
//           <div className="space-y-2">
//             <Label>Subject</Label>
//             <Input 
//               value={emailSubject} 
//               onChange={(e) => setEmailSubject(e.target.value)}
//               placeholder="Email subject"
//               className="text-base"
//             />
//           </div>

//           {/* Formatting Toolbar */}
//           <div className="border rounded-lg p-2 bg-gray-50">
//             <div className="flex flex-wrap gap-1">
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => execCommand('bold')}
//                 title="Bold"
//               >
//                 <Bold className="h-4 w-4" />
//               </Button>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => execCommand('italic')}
//                 title="Italic"
//               >
//                 <Italic className="h-4 w-4" />
//               </Button>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => execCommand('underline')}
//                 title="Underline"
//               >
//                 <Underline className="h-4 w-4" />
//               </Button>
              
//               <div className="w-px h-8 bg-gray-300 mx-1"></div>
              
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => execCommand('justifyLeft')}
//                 title="Align Left"
//               >
//                 <AlignLeft className="h-4 w-4" />
//               </Button>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => execCommand('justifyCenter')}
//                 title="Align Center"
//               >
//                 <AlignCenter className="h-4 w-4" />
//               </Button>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => execCommand('justifyRight')}
//                 title="Align Right"
//               >
//                 <AlignRight className="h-4 w-4" />
//               </Button>
              
//               <div className="w-px h-8 bg-gray-300 mx-1"></div>
              
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => execCommand('insertUnorderedList')}
//                 title="Bullet List"
//               >
//                 <List className="h-4 w-4" />
//               </Button>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => execCommand('insertOrderedList')}
//                 title="Numbered List"
//               >
//                 <ListOrdered className="h-4 w-4" />
//               </Button>
              
//               <div className="w-px h-8 bg-gray-300 mx-1"></div>
              
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={insertLink}
//                 title="Insert Link"
//               >
//                 <Link className="h-4 w-4" />
//               </Button>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => fileInputRef.current?.click()}
//                 title="Insert Image"
//               >
//                 <Image className="h-4 w-4" />
//               </Button>
              
//               <div className="w-px h-8 bg-gray-300 mx-1"></div>
              
//               <select
//                 onChange={(e) => {
//                   const size = e.target.value;
//                   if (size) execCommand('fontSize', size);
//                   e.target.value = '';
//                 }}
//                 className="text-sm border-0 bg-transparent cursor-pointer"
//                 defaultValue=""
//               >
//                 <option value="">Font Size</option>
//                 <option value="1">Small</option>
//                 <option value="3">Normal</option>
//                 <option value="5">Large</option>
//                 <option value="7">Huge</option>
//               </select>
//             </div>
//           </div>

//           {/* Placeholders */}
//           <div className="border rounded-lg p-3 bg-blue-50">
//             <p className="text-sm font-semibold mb-2 flex items-center gap-2">
//               <Type className="h-4 w-4" />
//               Insert Placeholders:
//             </p>
//             <div className="flex flex-wrap gap-2">
//               {['Agent Name', 'Origin', 'Destination', 'Cargo Type', 'Weight', 'Dimensions', 'Pickup Date', 'Delivery Date'].map(placeholder => (
//                 <Button
//                   key={placeholder}
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => insertPlaceholder(placeholder)}
//                   className="text-xs bg-white"
//                 >
//                   {placeholder}
//                 </Button>
//               ))}
//             </div>
//           </div>

//           {/* Rich Text Editor */}
//           <div className="space-y-2">
//             <div
//               ref={editorRef}
//               contentEditable
//               className="min-h-[400px] p-4 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               style={{
//                 lineHeight: '1.6',
//                 fontSize: '14px',
//                 fontFamily: 'Arial, sans-serif'
//               }}
//               onInput={(e) => {
//                 const target = e.target as HTMLDivElement;
//                 setHtmlContent(target.innerHTML);
//               }}
//             />
//           </div>

//           {/* Template Management */}
//           <div className="flex gap-2 flex-wrap items-center pt-4 border-t">
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="hidden"
//             />
            
//             <Input
//               placeholder="Template name..."
//               value={currentTemplateName}
//               onChange={(e) => setCurrentTemplateName(e.target.value)}
//               className="w-48"
//             />
//             <Button variant="outline" size="sm" onClick={saveTemplate}>
//               <Save className="h-4 w-4 mr-2" /> Save Template
//             </Button>
//             <Button variant="outline" size="sm" onClick={() => setShowTemplateManager(!showTemplateManager)}>
//               <FolderOpen className="h-4 w-4 mr-2" /> Templates ({savedTemplates.length})
//             </Button>
//           </div>

//           {/* Template Manager */}
//           {showTemplateManager && (
//             <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
//               <h4 className="font-semibold text-sm">Saved Templates</h4>
//               {savedTemplates.length === 0 ? (
//                 <p className="text-sm text-gray-500">No templates saved yet</p>
//               ) : (
//                 <div className="space-y-2">
//                   {savedTemplates.map(template => (
//                     <div key={template.id} className="flex items-center justify-between bg-white p-3 rounded border">
//                       <div>
//                         <p className="font-medium text-sm">{template.name}</p>
//                         <p className="text-xs text-gray-500">
//                           {new Date(template.createdAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button size="sm" variant="outline" onClick={() => loadTemplate(template)}>
//                           Load
//                         </Button>
//                         <Button size="sm" variant="destructive" onClick={() => deleteTemplate(template.id)}>
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Send Campaign */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Send Campaign</CardTitle>
//           <CardDescription>Configure delay and send your email campaign</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center gap-4">
//             <Label htmlFor="delay">Delay between emails (seconds):</Label>
//             <Input
//               id="delay"
//               type="number"
//               value={delaySeconds}
//               onChange={(e) => setDelaySeconds(Math.max(1, parseInt(e.target.value) || 15))}
//               className="w-20"
//               min="1"
//               max="300"
//             />
//             <span className="text-sm text-gray-600">
//               Total time: ~{Math.floor((delaySeconds * (emailStatuses.length - 1)) / 60)} minutes
//             </span>
//           </div>
          
//           <Button 
//             onClick={handleSendEmailsWithQueue} 
//             disabled={isSending}
//             className="w-full h-12 text-lg"
//           >
//             {isSending ? (
//               <>
//                 <Clock className="h-5 w-5 mr-2 animate-spin" /> 
//                 Sending Email {(currentSendingIndex ?? 0) + 1} of {emailStatuses.length}
//               </>
//             ) : (
//               <>
//                 <Send className="h-5 w-5 mr-2" /> Send Email Campaign ({emailStatuses.length} emails)
//               </>
//             )}
//           </Button>
//         </CardContent>
//       </Card>

//       {/* Email Status Tracking */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email Status Tracking</CardTitle>
//           <CardDescription>Monitor delivery and responses in real-time</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {emailStatuses.map((status, index) => (
//             <div 
//               key={status.id} 
//               className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
//                 currentSendingIndex === index 
//                   ? 'bg-blue-50 border-blue-300 shadow-md' 
//                   : status.status === 'waiting'
//                   ? 'bg-orange-50 border-orange-200'
//                   : 'hover:bg-gray-50'
//               }`}
//             >
//               <div className="flex items-center gap-4">
//                 {getStatusIcon(status.status)}
//                 <div>
//                   <p className="font-semibold">{status.agentName}</p>
//                   <p className="text-sm text-gray-600">{status.email}</p>
//                 </div>
//                 {currentSendingIndex === index && (
//                   <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
//                     Sending...
//                   </Badge>
//                 )}
//               </div>
//               <div className="flex items-center gap-4">
//                 {status.sentAt && <p className="text-gray-600 text-sm">Sent: {status.sentAt}</p>}
//                 {status.repliedAt && <p className="text-green-600 text-sm font-semibold">Replied: {status.repliedAt}</p>}
//                 {getStatusBadge(status.status, status.waitingFor)}
//               </div>
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload,
  Save,
  FolderOpen,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Type
} from 'lucide-react';

interface FreightQuery {
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  dimensions: string;
  pickupDate: string;
  deliveryDate: string;
  specialRequirements: string;
}

interface EmailStatus {
  id: string;
  agentName: string;
  email: string;
  ccemail: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'replied' | 'failed' | 'waiting';
  sentAt?: string;
  openedAt?: string;
  repliedAt?: string;
  waitingFor?: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  createdAt: string;
}

interface EmailConfirmationProps {
  recipients?: Array<{ id: string; name: string; email: string; ccemail: string }>;
}

export default function EmailConfirmation({ recipients }: EmailConfirmationProps) {
  // Freight Query State
  const [freightQuery, setFreightQuery] = useState<FreightQuery>({
    origin: '',
    destination: '',
    cargoType: '',
    weight: '',
    dimensions: '',
    pickupDate: '',
    deliveryDate: '',
    specialRequirements: ''
  });

  // Email template & subject
  const [emailSubject, setEmailSubject] = useState('Freight Quote Request - Urgent');
  const [htmlContent, setHtmlContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // Template management
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);
  const [currentTemplateName, setCurrentTemplateName] = useState('');
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email statuses and sending state
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentSendingIndex, setCurrentSendingIndex] = useState<number | null>(null);
  const [delaySeconds, setDelaySeconds] = useState(15);

  // Base URL for images
  const [imageBaseUrl, setImageBaseUrl] = useState('');

  // Load templates from database on mount
  useEffect(() => {
    fetch('/api/email-templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedTemplates(data);
        }
      })
      .catch(err => console.error('Failed to load templates:', err));
  }, []);

  // Load initial recipients
  useEffect(() => {
    fetch('/api/email-status')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(recipients) && recipients.length > 0) {
          const mapped = recipients.map(r => ({
            id: r.id,
            agentName: r.name,
            email: r.email,
            ccemail: r.ccemail,
            status: 'pending' as const,
          }));
          setEmailStatuses(mapped);
        } else if (Array.isArray(data) && data.length > 0) {
          setEmailStatuses(data);
        } else {
          fetch('/api/agents')
            .then(res => res.json())
            .then((agents) => {
              const seeded: EmailStatus[] = agents.map((a: any) => ({
                id: a.id,
                agentName: a.name,
                email: a.email,
                status: 'pending'
              }));
              setEmailStatuses(seeded);
            })
            .catch(err => console.error('Failed to fetch agents:', err));
        }
      })
      .catch(err => console.error('[EmailConfirmation] Failed to fetch email statuses:', err));
  }, [recipients]);

  // Initialize base URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setImageBaseUrl(window.location.origin);
    }
  }, []);

  // Initialize editor with default content
  useEffect(() => {
    if (editorRef.current && !htmlContent) {
      const defaultContent = `<p>Dear <strong>[Agent Name]</strong>,</p>
<p><br></p>
<p>We have a freight shipment opportunity that matches your service area and capabilities. Please review the details below:</p>
<p><br></p>
<p><strong>Shipment Details:</strong></p>
<ul>
  <li><strong>Origin:</strong> [Origin]</li>
  <li><strong>Destination:</strong> [Destination]</li>
  <li><strong>Cargo Type:</strong> [Cargo Type]</li>
  <li><strong>Weight:</strong> [Weight]</li>
  <li><strong>Dimensions:</strong> [Dimensions]</li>
  <li><strong>Pickup Date:</strong> [Pickup Date]</li>
  <li><strong>Delivery Date:</strong> [Delivery Date]</li>
</ul>
<p><br></p>
<p>We're looking for competitive rates and reliable service. Please provide your best quote at your earliest convenience.</p>
<p><br></p>
<p>Best regards,<br><strong>Acumen Freight Solutions</strong></p>
<p>Email: <a href="mailto:networkdesk@acumenfreight.org">networkdesk@acumenfreight.org</a></p>
<p>LinkedIn: <a href="https://www.linkedin.com/company/acumen-freight-solutions/">Acumen Freight Solutions</a></p>`;
      
      editorRef.current.innerHTML = defaultContent;
      setHtmlContent(defaultContent);
    }
  }, []);

  // Gmail-like formatting functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const span = document.createElement('span');
      span.textContent = `[${placeholder}]`;
      span.style.backgroundColor = '#e0e7ff';
      span.style.padding = '2px 6px';
      span.style.borderRadius = '3px';
      span.style.fontWeight = '500';
      range.insertNode(span);
      range.setStartAfter(span);
      range.setEndAfter(span);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    editorRef.current?.focus();
  };

  // Image upload handler with API upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB for email compatibility');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      const fullImageUrl = data.url.startsWith('http') 
        ? data.url 
        : `${imageBaseUrl}${data.url}`;

      const img = document.createElement('img');
      img.src = fullImageUrl;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '10px 0';

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.setStartAfter(img);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (editorRef.current) {
        editorRef.current.appendChild(img);
      }

      if (editorRef.current) {
        setHtmlContent(editorRef.current.innerHTML);
      }

      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again or use an external image URL.');
    }
  };

  // Template management
  const saveTemplate = async () => {
    if (!currentTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const content = editorRef.current?.innerHTML || '';

    try {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentTemplateName,
          subject: emailSubject,
          htmlContent: content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      const newTemplate = await response.json();
      setSavedTemplates(prev => [newTemplate, ...prev]);
      setCurrentTemplateName('');
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const loadTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.htmlContent;
      setHtmlContent(template.htmlContent);
    }
    setShowTemplateManager(false);
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch('/api/email-templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      setSavedTemplates(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  // Personalize HTML content
  const personalizeContent = (html: string, agent: EmailStatus) => {
    return html
      .replace(/\[Agent Name\]/g, agent.agentName)
      .replace(/\[Origin\]/g, freightQuery.origin)
      .replace(/\[Destination\]/g, freightQuery.destination)
      .replace(/\[Cargo Type\]/g, freightQuery.cargoType)
      .replace(/\[Weight\]/g, freightQuery.weight)
      .replace(/\[Dimensions\]/g, freightQuery.dimensions)
      .replace(/\[Pickup Date\]/g, freightQuery.pickupDate)
      .replace(/\[Delivery Date\]/g, freightQuery.deliveryDate);
  };

  // Queue-based email sending
  const handleSendEmailsWithQueue = () => {
    const content = editorRef.current?.innerHTML || '';
    
    setIsSending(true);
    console.log('Starting queued email campaign at:', new Date().toISOString());
    
    const sendNextEmail = (index: number) => {
      if (index >= emailStatuses.length) {
        setIsSending(false);
        setCurrentSendingIndex(null);
        console.log('All emails sent at:', new Date().toISOString());
        return;
      }

      setCurrentSendingIndex(index);
      const current = emailStatuses[index];
      console.log(`Sending queued email ${index + 1}/${emailStatuses.length} to ${current.email}`);

      const personalizedHtml = personalizeContent(content, current);
      const emailStartTime = Date.now();

      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: current.email,
          cc: current.ccemail,
          subject: emailSubject,
          html: personalizedHtml
        })
      })
      .then(res => {
        const emailDuration = Date.now() - emailStartTime;
        console.log(`Email API call ${index + 1} took ${emailDuration}ms`);
        
        if (!res.ok) {
          return res.text().then(text => {
            throw new Error(`HTTP ${res.status}: ${text}`);
          });
        }
        return res.json();
      })
      .then(() => {
        setEmailStatuses(prev => prev.map((status, idx) => 
          idx === index 
            ? { ...status, status: 'sent', sentAt: new Date().toLocaleString() }
            : status
        ));
        
        console.log(`Queued email ${index + 1} sent successfully to ${current.email}`);
      })
      .catch(err => {
        console.error(`Queued email ${index + 1} failed to ${current.email}:`, err);
        setEmailStatuses(prev => prev.map((status, idx) => 
          idx === index 
            ? { ...status, status: 'failed' }
            : status
        ));
      })
      .finally(() => {
        if (index < emailStatuses.length - 1) {
          const delayMs = delaySeconds * 1000;
          console.log(`Scheduling next email in ${delaySeconds} seconds...`);
          
          setCurrentSendingIndex(null);
          let remainingSeconds = delaySeconds;
          
          const countdownInterval = setInterval(() => {
            remainingSeconds--;
            setEmailStatuses(prev => prev.map((status, idx) => 
              idx === index + 1 
                ? { ...status, status: 'waiting', waitingFor: remainingSeconds }
                : status
            ));
            
            if (remainingSeconds <= 0) {
              clearInterval(countdownInterval);
              setEmailStatuses(prev => prev.map((status, idx) => 
                idx === index + 1 
                  ? { ...status, status: 'pending', waitingFor: undefined }
                  : status
              ));
            }
          }, 1000);
          
          setTimeout(() => {
            clearInterval(countdownInterval);
            sendNextEmail(index + 1);
          }, delayMs);
        } else {
          setIsSending(false);
          setCurrentSendingIndex(null);
        }
      });
    };

    sendNextEmail(0);
  };

  // Status UI helpers
  const getStatusIcon = (status: EmailStatus['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'waiting': return <Clock className="h-4 w-4 text-orange-600 animate-pulse" />;
      case 'sent': return <Send className="h-4 w-4 text-blue-600" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'opened': return <Mail className="h-4 w-4 text-indigo-600" />;
      case 'replied': return <CheckCircle className="h-4 w-4 text-green-700" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: EmailStatus['status'], waitingFor?: number) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      waiting: 'bg-orange-100 text-orange-800 border-orange-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      opened: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      replied: 'bg-green-100 text-green-900 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const displayStatus = status === 'waiting' && waitingFor ? `waiting (${waitingFor}s)` : status;
    return <Badge className={colors[status]} variant="outline">{displayStatus}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Campaign Management</h2>
          <p className="text-gray-600">Create professional emails and track responses</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="secondary">{emailStatuses.length} Recipients</Badge>
          <Badge className="bg-green-100 text-green-800">
            {emailStatuses.filter(s => s.status === 'replied').length} Replies
          </Badge>
        </div>
      </div>

      {/* Gmail-Style Email Composer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" /> Compose Email
              </CardTitle>
              <CardDescription>Write your email message with rich formatting</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject Line */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input 
              value={emailSubject} 
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject"
              className="text-base"
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="border rounded-lg p-2 bg-gray-50">
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('underline')}
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-8 bg-gray-300 mx-1"></div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyLeft')}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyCenter')}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyRight')}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-8 bg-gray-300 mx-1"></div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertUnorderedList')}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertOrderedList')}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-8 bg-gray-300 mx-1"></div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={insertLink}
                title="Insert Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                title="Insert Image"
              >
                <Image className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-8 bg-gray-300 mx-1"></div>
              
              <select
                onChange={(e) => {
                  const size = e.target.value;
                  if (size) execCommand('fontSize', size);
                  e.target.value = '';
                }}
                className="text-sm border-0 bg-transparent cursor-pointer"
                defaultValue=""
              >
                <option value="">Font Size</option>
                <option value="1">Small</option>
                <option value="3">Normal</option>
                <option value="5">Large</option>
                <option value="7">Huge</option>
              </select>
            </div>
          </div>

          {/* Placeholders */}
          <div className="border rounded-lg p-3 bg-blue-50">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Type className="h-4 w-4" />
              Insert Placeholders:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Agent Name', 'Origin', 'Destination', 'Cargo Type', 'Weight', 'Dimensions', 'Pickup Date', 'Delivery Date'].map(placeholder => (
                <Button
                  key={placeholder}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder(placeholder)}
                  className="text-xs bg-white"
                >
                  {placeholder}
                </Button>
              ))}
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <style>{`
              .email-editor ul {
                list-style-type: disc;
                padding-left: 40px;
                margin: 10px 0;
              }
              .email-editor ol {
                list-style-type: decimal;
                padding-left: 40px;
                margin: 10px 0;
              }
              .email-editor li {
                margin: 5px 0;
              }
              .email-editor p {
                margin: 10px 0;
              }
              .email-editor a {
                color: #1a73e8;
                text-decoration: underline;
              }
            `}</style>
            <div
              ref={editorRef}
              contentEditable
              className="email-editor min-h-[400px] p-4 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                lineHeight: '1.6',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif'
              }}
              onInput={(e) => {
                const target = e.target as HTMLDivElement;
                setHtmlContent(target.innerHTML);
              }}
            />
          </div>

          {/* Template Management */}
          <div className="flex gap-2 flex-wrap items-center pt-4 border-t">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <Input
              placeholder="Template name..."
              value={currentTemplateName}
              onChange={(e) => setCurrentTemplateName(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" size="sm" onClick={saveTemplate}>
              <Save className="h-4 w-4 mr-2" /> Save Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowTemplateManager(!showTemplateManager)}>
              <FolderOpen className="h-4 w-4 mr-2" /> Templates ({savedTemplates.length})
            </Button>
          </div>

          {/* Template Manager */}
          {showTemplateManager && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
              <h4 className="font-semibold text-sm">Saved Templates</h4>
              {savedTemplates.length === 0 ? (
                <p className="text-sm text-gray-500">No templates saved yet</p>
              ) : (
                <div className="space-y-2">
                  {savedTemplates.map(template => (
                    <div key={template.id} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => loadTemplate(template)}>
                          Load
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Campaign */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Send Campaign</CardTitle>
          <CardDescription>Configure delay and send your email campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="delay">Delay between emails (seconds):</Label>
            <Input
              id="delay"
              type="number"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Math.max(1, parseInt(e.target.value) || 15))}
              className="w-20"
              min="1"
              max="300"
            />
            <span className="text-sm text-gray-600">
              Total time: ~{Math.floor((delaySeconds * (emailStatuses.length - 1)) / 60)} minutes
            </span>
          </div>
          
          <Button 
            onClick={handleSendEmailsWithQueue} 
            disabled={isSending}
            className="w-full h-12 text-lg"
          >
            {isSending ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" /> 
                Sending Email {(currentSendingIndex ?? 0) + 1} of {emailStatuses.length}
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" /> Send Email Campaign ({emailStatuses.length} emails)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Email Status Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email Status Tracking</CardTitle>
          <CardDescription>Monitor delivery and responses in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailStatuses.map((status, index) => (
            <div 
              key={status.id} 
              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                currentSendingIndex === index 
                  ? 'bg-blue-50 border-blue-300 shadow-md' 
                  : status.status === 'waiting'
                  ? 'bg-orange-50 border-orange-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(status.status)}
                <div>
                  <p className="font-semibold">{status.agentName}</p>
                  <p className="text-sm text-gray-600">{status.email}</p>
                </div>
                {currentSendingIndex === index && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                    Sending...
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                {status.sentAt && <p className="text-gray-600 text-sm">Sent: {status.sentAt}</p>}
                {status.repliedAt && <p className="text-green-600 text-sm font-semibold">Replied: {status.repliedAt}</p>}
                {getStatusBadge(status.status, status.waitingFor)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}