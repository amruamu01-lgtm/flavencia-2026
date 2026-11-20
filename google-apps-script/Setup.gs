/**
 * FLAVENCIA 2026 – AUTOMATED SPREADSHEET & DRIVE FOLDER SETUP (Setup.gs)
 * Run this function once from the Apps Script editor: setupFlavenciaSystem()
 */

function setupFlavenciaSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Initializing FLAVENCIA 2026 Google Sheets Master Database...');
  
  // 1. Initialize Database Tables
  const initResult = initDatabaseStructure(ss);
  Logger.log('Tables Initialization: ' + JSON.stringify(initResult));

  // 2. Initialize Google Drive Folders
  Logger.log('Setting up Google Drive folders...');
  let rootFolders = DriveApp.getFoldersByName('FLAVENCIA FINANCE');
  let rootFolder;
  if (rootFolders.hasNext()) {
    rootFolder = rootFolders.next();
  } else {
    rootFolder = DriveApp.createFolder('FLAVENCIA FINANCE');
  }

  const subFolders = ['INCOME RECEIPTS', 'EXPENSE BILLS', 'FINANCIAL REPORTS', 'BACKUPS'];
  subFolders.forEach(folderName => {
    let check = rootFolder.getFoldersByName(folderName);
    if (!check.hasNext()) {
      rootFolder.createFolder(folderName);
      Logger.log('Created folder: ' + folderName);
    } else {
      Logger.log('Folder already exists: ' + folderName);
    }
  });

  Logger.log('=====================================================');
  Logger.log('FLAVENCIA 2026 SETUP COMPLETED SUCCESSFULLY!');
  Logger.log('Spreadsheet ID: ' + ss.getId());
  Logger.log('Drive Root Folder ID: ' + rootFolder.getId());
  Logger.log('Next step: Deploy as Web App (Execute as: Me, Access: Anyone)');
  Logger.log('=====================================================');
}
