import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">রিপোর্ট</h1>
      <Card>
        <CardHeader>
          <CardTitle>শীঘ্রই আসছে...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>এখানে দৈনিক এবং মাসিক বিক্রয় রিপোর্ট দেখা যাবে।</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
