import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@ssurak/ui/components/animate-ui/components/tabs";
import { Label } from "@ssurak/ui/components/forms/label";

type OptionSettingTabsProps = {
  formId: string;
  tabs: {
    value: string;
    label: string;
  }[];
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
};

export default function OptionSettingTabs({
  formId,
  children,
  tabs,
  value,
  onValueChange,
}: OptionSettingTabsProps) {
  return (
    <div className="flex justify-between items-center px-2">
      <Label
        className="text-xs font-bold text-muted-foreground"
        htmlFor={formId}
      >
        {children}
      </Label>
      <Tabs id={formId} value={value} onValueChange={onValueChange}>
        <TabsList className="h-10">
          {tabs.map((tab, i) => (
            <TabsTrigger
              key={`${tab.value}-${i}`}
              value={tab.value}
              className="text-[13px] h-8"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
