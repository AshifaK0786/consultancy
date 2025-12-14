import React, { useState, useEffect } from 'react';
import { Table, Alert, Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { purchasesAPI, salesAPI, reportsAPI, returnsAPI, profitLossAPI } from '../services/api';
import styled, { keyframes, css } from 'styled-components';
import { FaFilter, FaDownload, FaChartLine, FaShoppingCart, FaDollarSign, FaUpload } from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
} from 'recharts';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const AnimatedContainer = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderSection = styled.div`
  background: white;
  height: 100px;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  animation: ${slideIn} 0.5s ease-out;
`;

const FilterCard = styled(Card)`
  border: none;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  
  .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px 15px 0 0;
    border: none;
    font-weight: 600;
  }
`;

const GraphCard = styled(Card)`
  border: none;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  
  .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px 15px 0 0;
    border: none;
    font-weight: 600;
  }
`;

const StyledTable = styled(Table)`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  
  thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    th {
      border: none;
      padding: 1.2rem;
      font-weight: 500;
    }
  }
  
  tbody tr {
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    td {
      padding: 1.2rem;
      border-color: #e9ecef;
    }
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  padding: 0.8rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  }
`;

const SecondaryButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  transition: all 0.3s ease;
  border: 2px solid #667eea;
  color: #667eea;
  background: transparent;
  
  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1rem;
  
  .form-label {
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  .form-control, .form-select {
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    padding: 0.8rem;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
  }
`;

const TotalCard = styled(Card)`
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin: 1.5rem 0;
  animation: ${pulse} 2s infinite;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
`;

const ReportSection = styled.div`
  margin: 2rem 0;
  animation: ${fadeIn} 0.6s ease-out;
`;

const LoadingSpinner = styled(Spinner)`
  color: #667eea;
  width: 3rem;
  height: 3rem;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  border: none;
  border-radius: 15px;
  text-align: center;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  }
  
  .card-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #4a5568;
  }
  
  .card-text {
    font-size: 1.8rem;
    font-weight: 700;
    color: #667eea;
  }
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  td {
    padding: 1.2rem;
    border-color: #e9ecef;
  }
`;

const Reports = () => {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [chartData, setChartData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [reportSummary, setReportSummary] = useState(null);
  const [productSummary, setProductSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [statusSummary, setStatusSummary] = useState(null);
  const [selectedStatusProduct, setSelectedStatusProduct] = useState('');
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadedSheet, setUploadedSheet] = useState(null);
  const [comboDetails, setComboDetails] = useState({});

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [filter]);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductMonthlyData();
    }
  }, [selectedProduct, filter]);

  useEffect(() => {
    if (selectedStatusProduct) {
      console.log('Fetching status data for product:', selectedStatusProduct);
      fetchProductStatusData();
    }
  }, [selectedStatusProduct]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchasesRes, salesRes] = await Promise.all([
        purchasesAPI.getAll(),
        salesAPI.getAll()
      ]);
      setPurchases(purchasesRes.data);
      setSales(salesRes.data);
    } catch (error) {
      setError('Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await reportsAPI.getProductsList();
      setProducts(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedProduct(res.data[0]._id);
        setSelectedStatusProduct(res.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchChartData = async () => {
    setGraphLoading(true);
    try {
      const response = await reportsAPI.getPurchaseSalesData(filter.startDate, filter.endDate);
      setChartData(response.data.chartData || []);
      setReportSummary(response.data.summary || null);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setGraphLoading(false);
    }
  };

  const fetchProductMonthlyData = async () => {
    try {
      const response = await reportsAPI.getProductMonthlyData(
        selectedProduct,
        filter.startDate,
        filter.endDate
      );
      setProductData(response.data.chartData || []);
      setProductSummary(response.data.summary || null);
    } catch (error) {
      console.error('Failed to fetch product data:', error);
    }
  };

  const fetchProductStatusData = async () => {
    try {
      // If we have uploaded results, prioritize them
      if (uploadResults && uploadResults.length > 0) {
        processUploadedStatusData();
        return;
      }

      const returnsResponse = await returnsAPI.getAll();
      const returns = returnsResponse.data || [];

      // Get selected product name
      const selectedProductName = products.find(p => p._id === selectedStatusProduct)?.name;

      // Filter returns for selected product and calculate quantities
      const productReturns = returns.filter(returnItem =>
        returnItem.items?.some(item =>
          item.product === selectedStatusProduct ||
          item.productName === selectedProductName
        )
      );

      // Calculate status counts by quantity
      let rtoCount = 0;
      let rpuCount = 0;

      productReturns.forEach(returnItem => {
        const productItems = returnItem.items?.filter(item =>
          item.product === selectedStatusProduct ||
          item.productName === selectedProductName
        ) || [];
        const totalQuantity = productItems.reduce((sum, item) => sum + item.quantity, 0);

        if (returnItem.category === 'RTO') {
          rtoCount += totalQuantity;
        } else if (returnItem.category === 'RPU') {
          rpuCount += totalQuantity;
        }
      });

      const statusCounts = {
        RTO: rtoCount,
        RPU: rpuCount,
        Delivered: 0 // This would need to come from sales data
      };

      const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));

      const summary = {
        totalRTO: statusCounts.RTO,
        totalRPU: statusCounts.RPU,
        totalDelivered: statusCounts.Delivered,
        total: statusCounts.RTO + statusCounts.RPU + statusCounts.Delivered
      };

      setStatusData(chartData);
      setStatusSummary(summary);
    } catch (error) {
      console.error('Failed to fetch product status data:', error);
    }
  };

  const processUploadedStatusData = () => {
    if (!selectedStatusProduct || !uploadResults.length) return;

    const selectedProd = products.find(p => p._id === selectedStatusProduct);
    if (!selectedProd) return;

    // Normalize selected product data for matching
    const prodBarcode = (selectedProd.barcode || '').trim().toLowerCase();
    const prodName = (selectedProd.name || '').trim().toLowerCase();
    const prodId = selectedProd._id;

    let deliveredCount = 0;
    let rpuCount = 0;
    let rtoCount = 0;

    uploadResults.forEach(row => {
      // Normalize row data
      const rowSku = (row.sku || row.SKU || '').trim(); // Keep original case for map lookup first
      const normalizedRowSku = rowSku.toLowerCase();

      const qty = Number(row.quantity || row.Quantity || 1);
      const status = (row.status || row.Status || '').toLowerCase().trim();

      let matchQty = 0;

      // 1. Check Direct Match (by Barcode or Name? Usually Barcode is safer)
      if (normalizedRowSku === prodBarcode) {
        matchQty = qty;
      }
      // 2. Check Combo Match
      else {
        // Try to find combo details using the raw SKU or some normalized variant
        // The backend returns keys matching input SKUs so we should be able to look it up directly
        const combo = comboDetails[rowSku] || comboDetails[normalizedRowSku] || comboDetails[rowSku.toUpperCase()];

        if (combo && combo.products) {
          // Check if this combo contains our selected product
          const productInCombo = combo.products.find(p =>
            (p.productId === prodId) ||
            (p.productName && p.productName.toLowerCase() === prodName)
          );

          if (productInCombo) {
            matchQty = qty * (productInCombo.quantity || 1);
          }
        }
      }

      if (matchQty > 0) {
        if (status.includes('delivered') || status.includes('delivery')) {
          deliveredCount += matchQty;
        } else if (status.includes('rpu') || status.includes('returned') || status.includes('rpo')) {
          rpuCount += matchQty;
        } else if (status.includes('rto') || status.includes('return to origin')) {
          rtoCount += matchQty;
        }
      }
    });

    const statusCounts = {
      RTO: rtoCount,
      RPU: rpuCount,
      Delivered: deliveredCount
    };

    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    const summary = {
      totalRTO: statusCounts.RTO,
      totalRPU: statusCounts.RPU,
      totalDelivered: statusCounts.Delivered,
      total: statusCounts.RTO + statusCounts.RPU + statusCounts.Delivered
    };

    setStatusData(chartData);
    setStatusSummary(summary);
  };

  // Re-run status processing if upload results change
  useEffect(() => {
    if (uploadResults && uploadResults.length > 0) {
      processUploadedStatusData();
    }
  }, [uploadResults, selectedStatusProduct, comboDetails]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleStatusProductChange = (e) => {
    setSelectedStatusProduct(e.target.value);
  };

  const clearFilters = () => {
    setFilter({
      startDate: '',
      endDate: ''
    });
  };

  const filteredPurchases = purchases.filter(p => {
    const date = new Date(p.purchaseDate);
    const start = filter.startDate ? new Date(filter.startDate) : null;
    const end = filter.endDate ? new Date(filter.endDate) : null;
    return (!start || date >= start) && (!end || date <= end);
  });

  const filteredSales = sales.filter(s => {
    const date = new Date(s.saleDate);
    const start = filter.startDate ? new Date(filter.startDate) : null;
    const end = filter.endDate ? new Date(filter.endDate) : null;
    return (!start || date >= start) && (!end || date <= end);
  });

  const calculateTotals = (items) => {
    return items.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const calculateProfit = () => {
    const totalSales = calculateTotals(filteredSales);
    const totalPurchases = calculateTotals(filteredPurchases);
    return totalSales - totalPurchases;
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReportFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await profitLossAPI.uploadExcel(file);
      // Handle both legacy array response and new sheet doc response
      let savedResults = response.data.results || [];
      if (savedResults && !Array.isArray(savedResults)) {
        setUploadedSheet(savedResults);
        savedResults = savedResults.uploadedData || [];
      } else {
        setUploadedSheet(null);
      }
      setUploadResults(savedResults || []);
      setError('');

      // Look up combo details for uploaded SKUs
      if (savedResults && savedResults.length > 0) {
        const skus = savedResults
          .map(r => r.sku || r.SKU)
          .filter(s => s && typeof s === 'string')
          .map(s => s.trim());

        if (skus.length > 0) {
          try {
            const comboRes = await reportsAPI.lookupCombos(skus);
            setComboDetails(comboRes.data || {});
          } catch (err) {
            console.error('Failed to lookup combos:', err);
          }
        }
      }

      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && purchases.length === 0 && sales.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center">
        <LoadingSpinner animation="border" />
      </Container>
    );
  }

  const selectedProductName = products.find(p => p._id === selectedProduct)?.name || 'Product';

  return (
    <Container>
      <AnimatedContainer>
        <HeaderSection>
          <Row className="">
            <Col>
              <h4 className="mb-0 d-flex align-items-center">
                <IconWrapper style={{ fontSize: "1.3rem", marginRight: "0.6rem" }}>📊</IconWrapper>
                Financial Reports & Analytics
              </h4>
            </Col>
          </Row>
        </HeaderSection>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {/* Product-wise Analysis */}
        <GraphCard>
          <Card.Header>
            <IconWrapper>🎯</IconWrapper>
            Product-wise Analysis (Monthly Breakdown)
          </Card.Header>
          <Card.Body>
            <FormGroup className="mb-4">
              <Form.Label>Select Product</Form.Label>
              <Form.Select
                value={selectedProduct}
                onChange={handleProductChange}
                className="form-control"
              >
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </Form.Select>
            </FormGroup>

            {selectedProduct && (
              <>
                <div className="mb-4">
                  <h6>Summary for {selectedProductName}</h6>
                  <Row>
                    <Col md={3}>
                      <StatCard>
                        <Card.Title>Quantity Purchased</Card.Title>
                        <Card.Text>{productSummary?.totalPurchaseQuantity || 0}</Card.Text>
                      </StatCard>
                    </Col>
                    <Col md={3}>
                      <StatCard>
                        <Card.Title>Quantity Sold</Card.Title>
                        <Card.Text>{productSummary?.totalSalesQuantity || 0}</Card.Text>
                      </StatCard>
                    </Col>
                    <Col md={3}>
                      <StatCard>
                        <Card.Title>Purchase Value</Card.Title>
                        <Card.Text>${productSummary?.totalPurchaseAmount.toFixed(2) || 0}</Card.Text>
                      </StatCard>
                    </Col>
                    <Col md={3}>
                      <StatCard>
                        <Card.Title>Sales Value</Card.Title>
                        <Card.Text>${productSummary?.totalSalesAmount.toFixed(2) || 0}</Card.Text>
                      </StatCard>
                    </Col>
                  </Row>
                </div>

                {productData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={productData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Amount', angle: 90, position: 'insideRight' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f5f7fa',
                          border: '2px solid #667eea',
                          borderRadius: '10px'
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="purchaseQuantity" fill="#764ba2" name="Purchase Qty" />
                      <Bar yAxisId="left" dataKey="salesQuantity" fill="#667eea" name="Sales Qty" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <p>No data available for this product</p>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </GraphCard>

        {/* Product Status Report (RTO, RPU, Delivered) */}
        <GraphCard>
          <Card.Header>
            <IconWrapper>📊</IconWrapper>
            Product Status Report (RTO, RPU, Delivered)
          </Card.Header>
          <Card.Body>
            <FormGroup className="mb-4">
              <Form.Label>Upload Excel Data (Optional)</Form.Label>
              <div className="d-flex gap-3 align-items-center mb-3">
                <Form.Control
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleReportFileUpload}
                  style={{ display: 'none' }}
                  id="report-file-upload"
                />
                <label htmlFor="report-file-upload" className="w-100">
                  <PrimaryButton as="span" className="w-100 d-flex align-items-center justify-content-center">
                    <FaUpload className="me-2" />
                    {uploadResults.length > 0 ? 'File Uploaded (Click to Change)' : 'Upload Excel File'}
                  </PrimaryButton>
                </label>
                {uploadResults.length > 0 && (
                  <SecondaryButton onClick={() => { setUploadResults([]); setUploadedSheet(null); setComboDetails({}); }}>
                    Clear
                  </SecondaryButton>
                )}
              </div>

              {/* Combo Details Table */}
              {uploadResults.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Detailed Combo Breakdown from Upload</h6>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table bordered hover size="sm" responsive>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <tr className="bg-light">
                          <th>Combo SKU</th>
                          <th>Combo Name</th>
                          <th>Internal Contents (Product & Qty)</th>
                          <th>Status</th>
                          <th>Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResults.map((row, idx) => {
                          const sku = (row.sku || row.SKU || '').trim();
                          const details = comboDetails[sku];

                          const status = (row.status || row.Status || '').toString();
                          const qty = Number(row.quantity || row.Quantity || 1);

                          return (
                            <tr key={idx}>
                              <td className="fw-bold">{sku}</td>
                              <td>{details ? details.name : <span className="text-danger">No Match</span>}</td>
                              <td>
                                {details ? (
                                  <ul className="mb-0 ps-3" style={{ fontSize: '0.9rem' }}>
                                    {details.products.map((p, pIdx) => (
                                      <li key={pIdx}>
                                        {p.productName} (Qty: {p.quantity})
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <small className="text-muted">Combo details not found in DB</small>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${status.toLowerCase().includes('delivered') ? 'bg-success' :
                                  status.toLowerCase().includes('rto') ? 'bg-danger' :
                                    status.toLowerCase().includes('rpu') ? 'bg-warning text-dark' : 'bg-secondary'
                                  }`}>
                                  {status}
                                </span>
                              </td>
                              <td className="text-center">{qty}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              <Form.Label>Select Product</Form.Label>
              <Form.Select
                value={selectedStatusProduct}
                onChange={handleStatusProductChange}
                className="form-control"
              >
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </Form.Select>
            </FormGroup>

            {selectedStatusProduct && (
              <>
                <div className="mb-4">
                  <h6>Status Summary for {products.find(p => p._id === selectedStatusProduct)?.name || 'Product'}</h6>
                  <Row>
                    <Col md={3}>
                      <StatCard>
                        <Card.Title>📦 Delivered</Card.Title>
                        <Card.Text style={{ color: '#48bb78' }}>{statusSummary?.totalDelivered || 0}</Card.Text>
                      </StatCard>
                    </Col>
                    <Col md={3}>
                      <StatCard>
                        <Card.Title>↩️ RTO</Card.Title>
                        <Card.Text style={{ color: '#e53e3e' }}>{statusSummary?.totalRTO || 0}</Card.Text>
                      </StatCard>
                    </Col>
                    <Col md={3}>
                      <StatCard>
                        <Card.Title>🔄 RPU</Card.Title>
                        <Card.Text style={{ color: '#ed8936' }}>{statusSummary?.totalRPU || 0}</Card.Text>
                      </StatCard>
                    </Col>
                    <Col md={3}>
                      <StatCard>
                        <Card.Title>📊 Total</Card.Title>
                        <Card.Text>{statusSummary?.total || 0}</Card.Text>
                      </StatCard>
                    </Col>
                  </Row>
                </div>

                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={statusData} margin={{ top: 40, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f5f7fa',
                          border: '2px solid #667eea',
                          borderRadius: '10px'
                        }}
                        labelFormatter={(label) => `Status: ${label}`}
                        formatter={(value) => [value, 'Count']}
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Count"
                        label={{ position: 'top', fontSize: 14, fontWeight: 'bold' }}
                      >
                        {statusData.map((entry, index) => {
                          const colors = { 'Delivered': '#48bb78', 'RTO': '#e53e3e', 'RPU': '#ed8936' };
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[entry.status] || '#667eea'}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <p>No status data available for this product</p>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </GraphCard>

        {/* Purchases, Sales and Financial Summary removed */}
      </AnimatedContainer>
    </Container>
  );
};

export default Reports;
