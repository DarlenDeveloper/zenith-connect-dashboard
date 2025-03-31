
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { MicIcon, Play, Save, Plus, Trash2, Globe, VolumeX, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const AIVoiceSettings = () => {
  const [voiceSpeed, setVoiceSpeed] = useState([1]);
  const [voicePitch, setVoicePitch] = useState([1]);
  const [selectedVoice, setSelectedVoice] = useState("en-US-Neural2-F");
  
  // Sample voices for demonstration
  const voices = [
    { id: "en-US-Neural2-F", name: "Sarah", language: "English (US)", gender: "Female" },
    { id: "en-US-Neural2-M", name: "James", language: "English (US)", gender: "Male" },
    { id: "en-GB-Neural2-F", name: "Emma", language: "English (UK)", gender: "Female" },
    { id: "en-GB-Neural2-M", name: "William", language: "English (UK)", gender: "Male" },
    { id: "fr-FR-Neural2-F", name: "Sophie", language: "French", gender: "Female" },
    { id: "de-DE-Neural2-F", name: "Hannah", language: "German", gender: "Female" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <div className="flex items-center">
            <MicIcon className="mr-2 h-5 w-5 text-gray-500" />
            <h1 className="text-xl font-medium">AI Voice Settings</h1>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Voice selection */}
            <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Voice Selection</h2>
              
              <div className="flex justify-between mb-4">
                <div className="flex">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Globe className="mr-2 h-4 w-4" />
                    Filter by Language
                  </Button>
                  <Button variant="outline" size="sm">
                    Recent
                  </Button>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Voice
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {voices.map((voice) => (
                  <div 
                    key={voice.id}
                    className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-black transition-colors ${
                      selectedVoice === voice.id ? 'border-black bg-gray-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedVoice === voice.id ? 'bg-black text-white' : 'bg-gray-100'
                      }`}>
                        {voice.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-xs text-gray-500">{voice.language} • {voice.gender}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Voice settings */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Voice Properties</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Speed</label>
                      <span className="text-sm text-gray-600">{voiceSpeed[0]}x</span>
                    </div>
                    <div className="flex items-center">
                      <VolumeX className="h-4 w-4 text-gray-400 mr-2" />
                      <Slider
                        value={voiceSpeed}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={setVoiceSpeed}
                        className="flex-1 mx-2"
                      />
                      <Volume2 className="h-4 w-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Pitch</label>
                      <span className="text-sm text-gray-600">{voicePitch[0]}x</span>
                    </div>
                    <div className="flex items-center">
                      <VolumeX className="h-4 w-4 text-gray-400 mr-2" />
                      <Slider
                        value={voicePitch}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={setVoicePitch}
                        className="flex-1 mx-2"
                      />
                      <Volume2 className="h-4 w-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Test Your Voice</h2>
                
                <textarea 
                  className="w-full border border-gray-200 rounded-md p-3 h-24 text-sm resize-none mb-4"
                  placeholder="Enter text here to test the selected voice..."
                  defaultValue="Hello, I'm the AI assistant from Zenith. How can I help you today?"
                />
                
                <Button className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Play Sample
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default AIVoiceSettings;
