import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Book,
  Mail,
  FileText
} from "lucide-react";
import { useTitle } from "@/hooks/use-title";
import { TawkChat } from "@/components/tawk-chat";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function Help() {
  useTitle("Help Center & Support - Get Assistance with DealRadar");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Initialize Tawk.to chat
  useEffect(() => {
    // The TawkChat component will handle the initialization
  }, []);

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I start scanning for deals?",
      answer: "Select a store, enter your ZIP code, and click 'Start Scan' to find deals nearby.",
      category: "getting-started"
    },
    {
      id: "2", 
      question: "Which stores are supported?",
      answer: "Home Depot, Lowe's, Ace Hardware, and Amazon. Additional stores available with paid plans.",
      category: "stores"
    },
    {
      id: "3",
      question: "What's the difference between plan tiers?",
      answer: "Free: 1 scan/month. Pro: 10 scans/month ($9.99). Business: 50 scans/month ($24.99). Annual plans available with 33% savings.",
      category: "subscription"
    },
    {
      id: "4",
      question: "How does the affiliate program work?",
      answer: "Earn 25% commission on referrals who upgrade to paid plans. Get your referral link from your profile page.",
      category: "affiliate"
    },
    {
      id: "5",
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.",
      category: "subscription"
    },
    {
      id: "6",
      question: "How often should I scan for new deals?",
      answer: "Deals change frequently. We recommend scanning weekly or setting up alerts for specific products.",
      category: "getting-started"
    }
  ];

  const categories = [
    { id: "all", name: "All Topics", count: faqs.length },
    { id: "getting-started", name: "Getting Started", count: faqs.filter(f => f.category === "getting-started").length },
    { id: "stores", name: "Stores", count: faqs.filter(f => f.category === "stores").length },
    { id: "subscription", name: "Plans & Billing", count: faqs.filter(f => f.category === "subscription").length },
    { id: "affiliate", name: "Affiliate Program", count: faqs.filter(f => f.category === "affiliate").length }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center pt-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Help Center
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get support
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-help"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="w-5 h-5" />
                  <span>Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(category.id)}
                    data-testid={`button-category-${category.id}`}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Support Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="glass-card hover:scale-105 transition-transform cursor-pointer" onClick={() => {
                if (window.Tawk_API && window.Tawk_API.maximize) {
                  window.Tawk_API.maximize();
                } else {
                  // Fallback - open chat in a few seconds if Tawk not ready
                  setTimeout(() => {
                    if (window.Tawk_API && window.Tawk_API.maximize) {
                      window.Tawk_API.maximize();
                    }
                  }, 2000);
                }
              }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3 pulse-glow">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1 gradient-text">Live Chat Support</h3>
                  <p className="text-sm text-muted-foreground">Get instant help from real agents</p>
                  <Badge variant="secondary" className="mt-1 mb-2">Real-time support</Badge>
                  <Button size="sm" className="mt-3 bg-gradient-to-r from-blue-500 to-purple-600" data-testid="button-live-chat">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="glass-card hover:scale-105 transition-transform cursor-pointer" onClick={() => window.location.href = 'mailto:support@dealradar.com?subject=DealRadar Support Request'}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Email Support</h3>
                  <p className="text-sm text-muted-foreground">Detailed help via email</p>
                  <Badge variant="outline" className="mt-1 mb-2">24-48hr response</Badge>
                  <Button size="sm" variant="outline" className="mt-3" data-testid="button-email-support">
                    Send Email
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="glass-card hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open('/help', '_blank')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground">Self-service guides</p>
                  <Badge variant="outline" className="mt-1 mb-2">Instant access</Badge>
                  <Button size="sm" variant="outline" className="mt-3" data-testid="button-knowledge-base">
                    Browse Articles
                  </Button>
                </CardContent>
              </Card>
            </div>


            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Frequently Asked Questions</span>
                </CardTitle>
                {searchTerm && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Found {filteredFaqs.length} results for "{searchTerm}"
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No results found. Try adjusting your search.
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="space-y-2">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
        
        {/* Initialize Tawk.to Chat Widget */}
        <TawkChat />
      </div>
    </div>
  );
}