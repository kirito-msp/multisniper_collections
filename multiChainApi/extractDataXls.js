const mongoose = require('mongoose');
const config = require('./config.json');
const tokenInfoABI = require('./abis/tokenInfo.json');
const BscContract = require('./models/BscContract');
const ExcelJS = require('exceljs');

let lastBlockInMemory = 0
// MongoDB connection
const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;

mongoose.connect(mongoUri).then(() => {
    console.log('Connected to MongoDB');
  exportToExcel();
}).catch((err) => {
   // console.error('MongoDB connection error:', err);
});

async function exportToExcel() {
  try {
    const records = await BscContract.find({
      isRug: false,
      "statistics.twenty_four_hours.mcap": { $gt: 0 }
    })
    .sort({ timestamp: -1 })
    .select({
      name: 1,
      contractAddress: 1,
      "socials.web": 1,
      "socials.twitter": 1,
      "socials.telegram": 1,
      "statistics.price": 1,
      "statistics.initialMc": 1,
      "statistics.marketcap": 1,
      "statistics.ath": 1,
      "statistics.five_min": 1,
      "statistics.thirty_min": 1,
      "statistics.sixty_min": 1,
      "statistics.six_hours": 1,
      "statistics.twelve_hours": 1,
      "statistics.twenty_four_hours": 1,
      timestamp: 1
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('BSC Contracts');

    // Add column headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Contract Address', key: 'contractAddress', width: 45 },
      { header: 'Website', key: 'web', width: 30 },
      { header: 'Twitter', key: 'twitter', width: 30 },
      { header: 'Telegram', key: 'telegram', width: 30 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Initial MC', key: 'initialMc', width: 20 },
      { header: 'Marketcap', key: 'marketcap', width: 20 },
      { header: 'ATH', key: 'ath', width: 20 },
      { header: '5 Min MC', key: 'five_min_mcap', width: 20 },
      { header: '5 Min Growth %', key: 'five_min_growth', width: 20 },
      { header: '5 Min ATH', key: 'five_min_ath', width: 20 },
      { header: '30 Min MC', key: 'thirty_min_mcap', width: 20 },
      { header: '30 Min Growth %', key: 'thirty_min_growth', width: 20 },
      { header: '30 Min ATH', key: 'thirty_min_ath', width: 20 },
      { header: '60 Min MC', key: 'sixty_min_mcap', width: 20 },
      { header: '60 Min Growth %', key: 'sixty_min_growth', width: 20 },
      { header: '60 Min ATH', key: 'sixty_min_ath', width: 20 },
      { header: '6 Hours MC', key: 'six_hours_mcap', width: 20 },
      { header: '6 Hours Growth %', key: 'six_hours_growth', width: 20 },
      { header: '6 Hours ATH', key: 'six_hours_ath', width: 20 },
      { header: '12 Hours MC', key: 'twelve_hours_mcap', width: 20 },
      { header: '12 Hours Growth %', key: 'twelve_hours_growth', width: 20 },
      { header: '12 Hours ATH', key: 'twelve_hours_ath', width: 20 },
      { header: '24 Hours MC', key: 'twenty_four_hours_mcap', width: 20 },
      { header: '24 Hours Growth %', key: 'twenty_four_hours_growth', width: 20 },
      { header: '24 Hours ATH', key: 'twenty_four_hours_ath', width: 20 },
      { header: 'Timestamp', key: 'timestamp', width: 20 },
    ];

    // Populate rows
    records.forEach(record => {
      worksheet.addRow({
        name: record.name,
        contractAddress: record.contractAddress,
        web: record.socials.web,
        twitter: record.socials.twitter,
        telegram: record.socials.telegram,
        price: record.statistics.price,
        initialMc: record.statistics.initialMc,
        marketcap: record.statistics.marketcap,
        ath: record.statistics.ath,
        five_min_mcap: record.statistics.five_min.mcap,
        five_min_growth: record.statistics.five_min.growth,
        five_min_ath: record.statistics.five_min.ath,
        thirty_min_mcap: record.statistics.thirty_min.mcap,
        thirty_min_growth: record.statistics.thirty_min.growth,
        thirty_min_ath: record.statistics.thirty_min.ath,
        sixty_min_mcap: record.statistics.sixty_min.mcap,
        sixty_min_growth: record.statistics.sixty_min.growth,
        sixty_min_ath: record.statistics.sixty_min.ath,
        six_hours_mcap: record.statistics.six_hours.mcap,
        six_hours_growth: record.statistics.six_hours.growth,
        six_hours_ath: record.statistics.six_hours.ath,
        twelve_hours_mcap: record.statistics.twelve_hours.mcap,
        twelve_hours_growth: record.statistics.twelve_hours.growth,
        twelve_hours_ath: record.statistics.twelve_hours.ath,
        twenty_four_hours_mcap: record.statistics.twenty_four_hours.mcap,
        twenty_four_hours_growth: record.statistics.twenty_four_hours.growth,
        twenty_four_hours_ath: record.statistics.twenty_four_hours.ath,
        timestamp: new Date(record.timestamp * 1000).toISOString(),
      });
    });

    // Save Excel file
    const fileName = `BscContractsExport_${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(fileName);

    console.log(`Excel file successfully created: ${fileName}`);

    // Close the connection
    mongoose.connection.close();

  } catch (error) {
    console.error("Error exporting data:", error);
    mongoose.connection.close();
  }
}

