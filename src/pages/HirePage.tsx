  import React, { useState, useEffect, useMemo } from "react";
  import Navbar from "@/components/layout/Navbar";
  import { useToast } from "@/hooks/use-toast";
  import {
    Search,
    Sparkles,
    MessageSquare,
    Briefcase,
    Plus,
    Eye,
    Phone,
    ChevronDown,
    X,
    User,
    Mail,
    Loader2,
    MessageCircle,
    FileText,
    Edit2,
    Trash2,
  } from "lucide-react";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
  } from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
  import { profileAPI, hireApi, HiringAdInput, HiringAd } from "@/services/api";

  import { allCountries } from "country-telephone-data";

  interface HirePerson {
    id: string;
    name: string;
    email: string;
    skills: string[];
    description: string;
    avatar: string;
    portfolioUrl: string;
    whatsAppNumber: string;
  }

  interface CurrentUser {
    id?: string;
    email: string;
    username: string;
    imageUrl?: string;
    roles?: string[];
    isVerified?: boolean;
  }

  const HirePage: React.FC = () => {
    const [hirePeople, setHirePeople] = useState<HirePerson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [showHiringAdForm, setShowHiringAdForm] = useState(false);
    const [showViewAdDialog, setShowViewAdDialog] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [submittingAd, setSubmittingAd] = useState(false);
    const [loadingUserAd, setLoadingUserAd] = useState(false);
    const [userHiringAd, setUserHiringAd] = useState<HiringAd | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [enhancing, setEnhancing] = useState(false);


    const buildEmailBody = (person: HirePerson) => {
      return [
        `Hi ${person.name},`,
        ``,
        `I came across your profile on HivGrid and was impressed by your skills in ${person.skills
          .slice(0, 3)
          .join(", ")}.`,
        ``,
        `I have a project that would be a great fit for your expertise.`,
        ``,
        `Project Overview:`,
        `- [Briefly describe your project here]`,
        ``,
        `Best regards,`,
      ].join("\n");
    };

    const { toast } = useToast();

    const countryCodes = useMemo(() => {
      return allCountries
        .map((country) => ({
          code: `+${country.dialCode}`,
          name: country.name,
          flag: country.flag || country.iso2.toUpperCase(),
          iso2: country.iso2,
          priority: country.priority || 0,
        }))
        .sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return a.name.localeCompare(b.name);
        });
    }, []);

    const filteredCountries = useMemo(() => {
      if (!countrySearch.trim()) return countryCodes;

      const searchLower = countrySearch.toLowerCase();
      return countryCodes.filter(
        (country) =>
          country.name.toLowerCase().includes(searchLower) ||
          country.code.toLowerCase().includes(searchLower) ||
          country.iso2.toLowerCase().includes(searchLower)
      );
    }, [countryCodes, countrySearch]);

    const artFilterOptions = [
      "UI Design",
      "Figma",
      "Animated Arts",
      "Arts",
      "3D Arts",
      "Designs",
    ];

    const [adForm, setAdForm] = useState({
      userName: "",
      userEmail: "",
      countryCode: "+1",
      phoneNumber: "",
      description: "",
      selectedSkills: [] as string[],
    });

    const getFlagEmoji = (countryCode: string) => {
      const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };

    const handleEnhanceDescription = async () => {
  if (!adForm.description.trim()) return;

  try {
    setEnhancing(true);

    const response = await hireApi.hireAdDescriptionEnhance(
      adForm.description
    );

    console.log(response)

    setAdForm((prev) => ({
      ...prev,
      description: response.enhancedDescription,
    }));
  } catch (error) {
    console.error("Failed to enhance description", error);
  } finally {
    setEnhancing(false);
  }
};

    const selectedCountry = useMemo(() => {
      return countryCodes.find((country) => country.code === adForm.countryCode);
    }, [adForm.countryCode, countryCodes]);

    const loadUserProfile = async () => {
      try {
        setLoadingUser(true);
        const response = await profileAPI.getUserProfile();
        const userData = response.user;

        setCurrentUser({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          imageUrl:
            userData.imageUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          roles: userData.roles,
          isVerified: userData.isVerified,
        });
      } catch (error: any) {
        console.error("Failed to load user profile:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoadingUser(false);
      }
    };

    const loadUserHiringAd = async () => {
      if (!currentUser) return;

      try {
        setLoadingUserAd(true);

        const response = await hireApi.getMyHiringAd();

        console.log(response);

        if (!response) {
          setUserHiringAd(null);
          return;
        }

        setUserHiringAd(response);

        let phoneNumber = "";
        let countryCode = "+1";

        if (response.whatsApp) {
          const foundCountry = countryCodes.find(c =>
            response.whatsApp.startsWith(c.code)
          );

          if (foundCountry) {
            countryCode = foundCountry.code;
            phoneNumber = response.whatsApp.slice(foundCountry.code.length);
          } else {
            phoneNumber = response.whatsApp.replace(/\D/g, "");
          }
        }


        setAdForm({
          userName: response.username || currentUser.username,
          userEmail: response.email || currentUser.email,
          countryCode,
          phoneNumber,
          description: response.description || "",
          selectedSkills: response.selectedSkills || [],
        });
      } catch (error: any) {
        console.error("Failed to load user hiring ad:", error);
        if (error.response?.status !== 404 && error.response?.status !== 401) {
          toast({
            title: "Error",
            description:
              error.response?.data?.message || "Failed to load your hiring ad",
            variant: "destructive",
          });
        }
      } finally {
        setLoadingUserAd(false);
      }
    };

    const loadHirePeople = async () => {
      try {
        setIsLoading(true);

        const response = await hireApi.getAllHiringAds();

        const mappedPeople: HirePerson[] = response.map((ad) => ({
          id: ad._id,
          name: ad.username || ad.user.username,
          email: ad.email,
          skills: ad.selectedSkills,
          description: ad.description,
          whatsAppNumber: ad.whatsApp || "",
          avatar:
            ad.user.imageUrl ??
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${ad.username}`,
          portfolioUrl: ad.whatsApp
            ? `https://wa.me/${ad.whatsApp.replace(/\D/g, "")}`
            : "#",
        }));

        setHirePeople(mappedPeople);
      } catch (error) {
        console.error("Failed to load hire people:", error);
        toast({
          title: "Error",
          description: "Failed to load professionals",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      const loadData = async () => {
        await loadHirePeople();
      };

      loadData();
    }, []);

    useEffect(() => {
      loadUserProfile();
    }, []);

    useEffect(() => {
      if (showHiringAdForm && currentUser && !userHiringAd) {
        setAdForm({
          userName: currentUser.username,
          userEmail: currentUser.email,
          countryCode: "+1",
          phoneNumber: "",
          description: "",
          selectedSkills: [],
        });
        setCountrySearch("");
        setImageLoading(true);
      }
    }, [showHiringAdForm, currentUser, userHiringAd]);

    useEffect(() => {
      if (showViewAdDialog && currentUser) {
        loadUserHiringAd();
        setIsEditing(false);
      }
    }, [showViewAdDialog, currentUser]);

    const handleImageLoad = () => {
      setImageLoading(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
        });
      }
    };

    const handleMessage = (person: HirePerson) => {
      toast({
        title: "Message sent",
        description: `Message request sent to ${person.name}`,
      });
    };

    const handleViewWork = (person: HirePerson) => {
      window.open(person.portfolioUrl, "_blank");
    };

    const toggleSkill = (skill: string) => {
      setSelectedSkills((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      );
    };

    const toggleAdSkill = (skill: string) => {
      setAdForm((prev) => ({
        ...prev,
        selectedSkills: prev.selectedSkills.includes(skill)
          ? prev.selectedSkills.filter((s) => s !== skill)
          : [...prev.selectedSkills, skill],
      }));
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = e.target.value.replace(/\D/g, "");
      setAdForm({ ...adForm, phoneNumber: formatted });
    };

    const getFullWhatsAppNumber = () => {
      return adForm.countryCode + adForm.phoneNumber;
    };

    const handleSubmitAd = async () => {
      if (!adForm.userName || !adForm.userEmail || !adForm.description) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }

      if (adForm.phoneNumber && !/^\d{8,15}$/.test(adForm.phoneNumber)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number (8-15 digits)",
          variant: "destructive",
        });
        return;
      }

      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to create a hiring ad",
          variant: "destructive",
        });
        return;
      }

      setSubmittingAd(true);
      try {
        const adData: HiringAdInput = {
          name: adForm.userName,
          userEmail: adForm.userEmail,
          description: adForm.description,
          selectedSkills: adForm.selectedSkills,
          countryCode: adForm.countryCode,
          phoneNumber: adForm.phoneNumber,
        };

        const response = await hireApi.createHiringAd(adData);

        await Promise.all([loadUserHiringAd(), loadHirePeople()]);

        if (currentUser) {
          setAdForm({
            userName: currentUser.username,
            userEmail: currentUser.email,
            countryCode: "+1",
            phoneNumber: "",
            description: "",
            selectedSkills: [],
          });
        }

        setShowHiringAdForm(false);
        setCountrySearch("");

        toast({
          title: "Success!",
          description: "Your hiring ad has been published",
        });
      } catch (error: any) {
        console.error("Failed to create hiring ad:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to publish hiring ad",
          variant: "destructive",
        });
      } finally {
        setSubmittingAd(false);
      }
    };

    const handleUpdateAd = async () => {
      if (!adForm.userName || !adForm.userEmail || !adForm.description) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }

      if (adForm.phoneNumber && !/^\d{8,15}$/.test(adForm.phoneNumber)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number (8-15 digits)",
          variant: "destructive",
        });
        return;
      }

      if (!currentUser || !userHiringAd) {
        toast({
          title: "Error",
          description: "You must be logged in to update a hiring ad",
          variant: "destructive",
        });
        return;
      }

      setSubmittingAd(true);
      try {
        const adData: HiringAdInput = {
          name: adForm.userName,
          userEmail: adForm.userEmail,
          description: adForm.description,
          selectedSkills: adForm.selectedSkills,
          countryCode: adForm.countryCode,
          phoneNumber: adForm.phoneNumber,
        };

        await hireApi.updateMyHiringAd(adData);

        await Promise.all([loadUserHiringAd(), loadHirePeople()]);

        setIsEditing(false);
        setCountrySearch("");

        toast({
          title: "Success!",
          description: "Your hiring ad has been updated",
        });
      } catch (error: any) {
        console.error("Failed to update hiring ad:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to update hiring ad",
          variant: "destructive",
        });
      } finally {
        setSubmittingAd(false);
      }
    };

    const filteredPeople = hirePeople.filter((person) => {
      const matchesSearch =
        searchQuery === "" ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every((skill) => person.skills.includes(skill));

      return matchesSearch && matchesSkills;
    });

    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-24 pb-8 px-4 gradient-subtle">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Briefcase className="w-4 h-4" />
                Find talented professionals
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Hire Top Creatives
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Connect with verified designers, developers, and creators ready
                for your next project.
              </p>
            </div>

            <div
              className="max-w-2xl mx-auto animate-fade-in mb-8"
              style={{ animationDelay: "100ms" }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, role, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base rounded-2xl shadow-card border-0 bg-card"
                />
              </div>
            </div>

            <div
              className="animate-fade-in mb-8"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto mb-6">
                {artFilterOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSkills.includes(skill)
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
                {selectedSkills.length > 0 && (
                  <button
                    onClick={() => setSelectedSkills([])}
                    className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Dialog
                  open={showHiringAdForm}
                  onOpenChange={setShowHiringAdForm}
                >
                  <DialogTrigger asChild>
                    <Button className="rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Publish Your Hiring Ad
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                      <DialogTitle>Create Hiring Ad</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4 px-1">
                      {loadingUser ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : currentUser ? (
                        <>
                          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full border-2 border-border overflow-hidden bg-muted">
                                {imageLoading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                  </div>
                                )}
                                <img
                                  src={currentUser.imageUrl}
                                  alt={currentUser.username}
                                  className={`w-full h-full object-cover ${
                                    imageLoading ? "opacity-0" : "opacity-100"
                                  }`}
                                  onLoad={handleImageLoad}
                                  onError={handleImageError}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">
                                {currentUser.username}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {currentUser.email}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Your profile information will be used for this ad
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="username">Your Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="username"
                                placeholder="Enter your name"
                                value={adForm.userName}
                                readOnly
                                className="pl-10 bg-muted/50 cursor-not-allowed"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  Auto-filled
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Name is taken from your profile and cannot be edited
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={adForm.userEmail}
                                readOnly
                                className="pl-10 bg-muted/50 cursor-not-allowed"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  Auto-filled
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Email is taken from your profile and cannot be
                              edited
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="whatsapp">
                              WhatsApp Number (Optional)
                            </Label>
                            <div className="flex gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-32 justify-between"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-lg">
                                        {selectedCountry?.flag ||
                                          getFlagEmoji(
                                            selectedCountry?.iso2 || "US"
                                          )}
                                      </span>
                                      <span>{selectedCountry?.code}</span>
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-80 p-0"
                                  align="start"
                                >
                                  <div className="p-3 border-b">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                      <Input
                                        placeholder="Search country or code..."
                                        value={countrySearch}
                                        onChange={(e) =>
                                          setCountrySearch(e.target.value)
                                        }
                                        className="pl-9 h-9"
                                      />
                                      {countrySearch && (
                                        <button
                                          onClick={() => setCountrySearch("")}
                                          className="absolute right-2 top-1/2 -translate-y-1/2"
                                        >
                                          <X className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="max-h-[300px] overflow-y-auto">
                                    {filteredCountries.length === 0 ? (
                                      <div className="py-8 text-center text-muted-foreground">
                                        No countries found
                                      </div>
                                    ) : (
                                      filteredCountries.map((country) => (
                                        <button
                                          key={`${country.code}-${country.iso2}`}
                                          className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-3"
                                          onClick={() => {
                                            setAdForm({
                                              ...adForm,
                                              countryCode: country.code,
                                            });
                                            setCountrySearch("");
                                          }}
                                        >
                                          <span className="text-lg">
                                            {country.flag ||
                                              getFlagEmoji(country.iso2)}
                                          </span>
                                          <span className="flex-1 truncate">
                                            {country.name}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {country.code}
                                          </span>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <div className="flex-1 relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="whatsapp"
                                  type="tel"
                                  placeholder="Phone number"
                                  value={adForm.phoneNumber}
                                  onChange={handlePhoneNumberChange}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-xs text-muted-foreground">
                                Full number:{" "}
                                {adForm.phoneNumber
                                  ? getFullWhatsAppNumber()
                                  : "Not provided"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Artists can contact you via WhatsApp
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">
                              Project Description *
                            </Label>
                            <Textarea
                              id="description"
                              placeholder="Describe what you're looking for, project details, budget, timeline, etc."
                              value={adForm.description}
                              onChange={(e) =>
                                setAdForm({
                                  ...adForm,
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                              className="min-h-[100px]"
                            />
                              <Button
                                type="button"
                                onClick={handleEnhanceDescription}
                                disabled={enhancing || !adForm.description.trim()}
                              >
                                {enhancing ? "Enhancing..." : "Enhance the description"}
                              </Button>
                          </div>

                          <div className="space-y-2">
                            <Label>Required Skills (Select one or more)</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {artFilterOptions.map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => toggleAdSkill(skill)}
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    adForm.selectedSkills.includes(skill)
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="sticky bottom-0 bg-background pt-4 pb-2 mt-6 border-t">
                            <Button
                              onClick={handleSubmitAd}
                              className="w-full"
                              disabled={submittingAd}
                            >
                              {submittingAd ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Publishing...
                                </>
                              ) : (
                                "Publish Hiring Ad"
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-foreground mb-2">
                            Not Logged In
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Please log in to create a hiring ad
                          </p>
                          <Button asChild>
                            <a href="/login">Log In</a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={showViewAdDialog}
                  onOpenChange={setShowViewAdDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-xl">
                      <FileText className="w-4 h-4 mr-2" />
                      View Your Hiring Ad
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                      <DialogTitle>
                        {isEditing ? "Edit Your Hiring Ad" : "Your Hiring Ad"}
                      </DialogTitle>
                      <DialogDescription>
                        {isEditing
                          ? "Update your project details and skills"
                          : "View your published hiring ad"}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 px-1">
                      {loadingUserAd ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : !currentUser ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-foreground mb-2">
                            Not Logged In
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Please log in to view your hiring ad
                          </p>
                          <Button asChild>
                            <a href="/login">Log In</a>
                          </Button>
                        </div>
                      ) : !userHiringAd ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-foreground mb-2">
                            No Hiring Ad Published
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            You haven't published any hiring ads yet. Create one
                            to start attracting talent!
                          </p>
                          <Button
                            onClick={() => {
                              setShowViewAdDialog(false);
                              setShowHiringAdForm(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Hiring Ad
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full border-2 border-border overflow-hidden bg-muted">
                                <img
                                  src={
                                    userHiringAd.user.imageUrl ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userHiringAd.username}`
                                  }
                                  alt={userHiringAd.username}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">
                                {userHiringAd.username}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {userHiringAd.email}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Published{" "}
                                {new Date(
                                  userHiringAd.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {isEditing ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">
                                  Project Description *
                                </Label>
                                <Textarea
                                  id="edit-description"
                                  placeholder="Describe what you're looking for, project details, budget, timeline, etc."
                                  value={adForm.description}
                                  onChange={(e) =>
                                    setAdForm({
                                      ...adForm,
                                      description: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  className="min-h-[100px]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-whatsapp">
                                  WhatsApp Number (Optional)
                                </Label>
                                <div className="flex gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-32 justify-between"
                                      >
                                        <span className="flex items-center gap-2">
                                          <span className="text-lg">
                                            {selectedCountry?.flag ||
                                              getFlagEmoji(
                                                selectedCountry?.iso2 || "US"
                                              )}
                                          </span>
                                          <span>{selectedCountry?.code}</span>
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-80 p-0"
                                      align="start"
                                    >
                                      <div className="p-3 border-b">
                                        <div className="relative">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                          <Input
                                            placeholder="Search country or code..."
                                            value={countrySearch}
                                            onChange={(e) =>
                                              setCountrySearch(e.target.value)
                                            }
                                            className="pl-9 h-9"
                                          />
                                          {countrySearch && (
                                            <button
                                              onClick={() => setCountrySearch("")}
                                              className="absolute right-2 top-1/2 -translate-y-1/2"
                                            >
                                              <X className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className="max-h-[300px] overflow-y-auto">
                                        {filteredCountries.length === 0 ? (
                                          <div className="py-8 text-center text-muted-foreground">
                                            No countries found
                                          </div>
                                        ) : (
                                          filteredCountries.map((country) => (
                                            <button
                                              key={`${country.code}-${country.iso2}`}
                                              className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-3"
                                              onClick={() => {
                                                setAdForm({
                                                  ...adForm,
                                                  countryCode: country.code,
                                                });
                                                setCountrySearch("");
                                              }}
                                            >
                                              <span className="text-lg">
                                                {country.flag ||
                                                  getFlagEmoji(country.iso2)}
                                              </span>
                                              <span className="flex-1 truncate">
                                                {country.name}
                                              </span>
                                              <span className="text-muted-foreground">
                                                {country.code}
                                              </span>
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <div className="flex-1 relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                      id="edit-whatsapp"
                                      type="tel"
                                      placeholder="Phone number"
                                      value={adForm.phoneNumber}
                                      onChange={handlePhoneNumberChange}
                                      className="pl-10"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <p className="text-xs text-muted-foreground">
                                    Full number:{" "}
                                    {adForm.phoneNumber
                                      ? getFullWhatsAppNumber()
                                      : "Not provided"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Artists can contact you via WhatsApp
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>
                                  Required Skills (Select one or more)
                                </Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {artFilterOptions.map((skill) => (
                                    <button
                                      key={skill}
                                      type="button"
                                      onClick={() => toggleAdSkill(skill)}
                                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        adForm.selectedSkills.includes(skill)
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                                      }`}
                                    >
                                      {skill}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="sticky bottom-0 bg-background pt-4 pb-2 mt-6 border-t flex gap-2">
                                <Button
                                  onClick={handleUpdateAd}
                                  className="flex-1"
                                  disabled={submittingAd}
                                >
                                  {submittingAd ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Update Ad"
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsEditing(false)}
                                  disabled={submittingAd}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <Label>Project Description</Label>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <p className="whitespace-pre-line">
                                    {userHiringAd.description}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Contact Information</Label>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span>{userHiringAd.email}</span>
                                  </div>
                                  {userHiringAd.whatsApp && (
                                    <div className="flex items-center gap-2">
                                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                      <span>{userHiringAd.whatsApp}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Required Skills</Label>
                                <div className="flex flex-wrap gap-2">
                                  {userHiringAd.selectedSkills.map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="sticky bottom-0 bg-background pt-4 pb-2 mt-6 border-t flex gap-2">
                                <Button
                                  onClick={() => setIsEditing(true)}
                                  className="flex-1"
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit Ad
                                </Button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-[400px] bg-card rounded-2xl"></div>
                </div>
              ))}
            </div>
          ) : filteredPeople.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPeople.map((person) => (
                <div
                  key={person.id}
                  className="bg-card rounded-2xl shadow-card border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-border overflow-hidden bg-muted">
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-xl font-semibold text-foreground">
                              {person.name}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {person.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6 line-clamp-2">
                      {person.description}
                    </p>

                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {person.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 border-t border-border">
                    <div className="flex gap-3">
                      <a
                        href={`https://wa.me/${person.whatsAppNumber.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </a>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full h-11 rounded-xl"
                      >
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${
                            person.email
                          }&su=${encodeURIComponent(
                            "Regarding your hiring ad"
                          )}&body=${encodeURIComponent(buildEmailBody(person))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No matches found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSkills([]);
                }}
                variant="outline"
              >
                Clear all filters
              </Button>
            </div>
          )}

          {!isLoading && filteredPeople.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border text-center">
              <p className="text-muted-foreground">
                Showing {filteredPeople.length} of {hirePeople.length}{" "}
                professionals
                {selectedSkills.length > 0 &&
                  ` matching ${selectedSkills.length} skill(s)`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default HirePage;
