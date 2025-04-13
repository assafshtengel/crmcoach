import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*');

        if (error) {
          console.error('Error fetching reports:', error);
        } else {
          setReports(data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="outline"
        size="icon"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>

      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      <div className="mb-4">
        <Label htmlFor="search">Search Reports:</Label>
        <Input
          type="text"
          id="search"
          placeholder="Search by title or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading reports...</div>
      ) : (
        <ul>
          {filteredReports.map(report => (
            <li key={report.id} className="mb-2">
              <strong>{report.title}</strong> - {report.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reports;
