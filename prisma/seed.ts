import { PrismaClient } from '@prisma/client';

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const db = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

async function main() {
  console.log('Seeding ADRConnect database...');

  const hospital = await db.hospital.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'District Maternal Hospital',
      state: 'Madhya Pradesh',
    },
  });

  const [nurse1, nurse2, adrHead, admin] = await Promise.all([
    db.user.upsert({
      where: { employeeId: 'N-1001' },
      update: { role: 'nurse', ward: 'Maternity Ward' },
      create: {
        hospitalId: hospital.id,
        name: 'Asha Verma',
        email: 'asha.verma@hospital.example',
        role: 'nurse',
        employeeId: 'N-1001',
        ward: 'Maternity Ward',
        occupation: 'Staff Nurse',
      },
    }),
    db.user.upsert({
      where: { employeeId: 'N-1002' },
      update: { role: 'nurse', ward: 'Medical Ward' },
      create: {
        hospitalId: hospital.id,
        name: 'Meena Devi',
        email: 'meena.devi@hospital.example',
        role: 'nurse',
        employeeId: 'N-1002',
        ward: 'Medical Ward',
        occupation: 'Senior Staff Nurse',
      },
    }),
    db.user.upsert({
      where: { employeeId: 'AH-2001' },
      update: { role: 'adr_head' },
      create: {
        hospitalId: hospital.id,
        name: 'Dr. Priya Nair',
        email: 'priya.nair@hospital.example',
        role: 'adr_head',
        employeeId: 'AH-2001',
        occupation: 'Pharmacovigilance Officer & Physician',
      },
    }),
    db.user.upsert({
      where: { employeeId: 'AD-3001' },
      update: { role: 'admin' },
      create: {
        hospitalId: hospital.id,
        name: 'IT Admin',
        email: 'admin@hospital.example',
        role: 'admin',
        employeeId: 'AD-3001',
        occupation: 'Hospital Pharmacy & IT Administrator',
      },
    }),
  ]);

  const [dextrose, saline, ringerLactate, dexamethasone, dns, ceftriaxone] = await Promise.all([
    db.drugProduct.upsert({
      where: { id: '10000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '10000000-0000-0000-0000-000000000001',
        name: 'Dextrose 5% IV Infusion',
        genericName: 'Dextrose Anhydrous IP',
        form: '500ml IV infusion',
      },
    }),
    db.drugProduct.upsert({
      where: { id: '10000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '10000000-0000-0000-0000-000000000002',
        name: 'Normal Saline 0.9%',
        genericName: 'Sodium Chloride IP',
        form: '500ml IV infusion',
      },
    }),
    db.drugProduct.upsert({
      where: { id: '10000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '10000000-0000-0000-0000-000000000003',
        name: 'Ringer Lactate (RL)',
        genericName: "Ringer's Lactate Solution",
        form: '500ml IV infusion',
      },
    }),
    db.drugProduct.upsert({
      where: { id: '10000000-0000-0000-0000-000000000004' },
      update: {},
      create: {
        id: '10000000-0000-0000-0000-000000000004',
        name: 'Dexamethasone Injection',
        genericName: 'Dexamethasone Sodium Phosphate',
        form: '2ml injection',
      },
    }),
    db.drugProduct.upsert({
      where: { id: '10000000-0000-0000-0000-000000000005' },
      update: {},
      create: {
        id: '10000000-0000-0000-0000-000000000005',
        name: 'DNS (Dextrose 5% + Sodium Chloride 0.9%)',
        genericName: 'Dextrose with Normal Saline IP',
        form: '500ml IV infusion',
      },
    }),
    db.drugProduct.upsert({
      where: { id: '10000000-0000-0000-0000-000000000006' },
      update: {},
      create: {
        id: '10000000-0000-0000-0000-000000000006',
        name: 'Ceftriaxone 1g Injection',
        genericName: 'Ceftriaxone Sodium IP',
        form: 'Vial with SWFI',
      },
    }),
  ]);

  const [visionParenteral, apexLife, medica, bioCare] = await Promise.all([
    db.manufacturer.upsert({
      where: { id: '20000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '20000000-0000-0000-0000-000000000001',
        name: 'Vision Parenteral Pvt. Ltd.',
        address: 'Plot 45, Pharma Zone, Pithampur, MP',
        licenseNo: 'MP/DRUG/2021/789',
      },
    }),
    db.manufacturer.upsert({
      where: { id: '20000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '20000000-0000-0000-0000-000000000002',
        name: 'Apex Life Sciences',
        address: 'Baddi Industrial Estate, Solan, HP',
        licenseNo: 'HP/MFG/2019/332',
      },
    }),
    db.manufacturer.upsert({
      where: { id: '20000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '20000000-0000-0000-0000-000000000003',
        name: 'Medica Pharmaceuticals',
        address: 'GIDC Ankleshwar, Gujarat',
        licenseNo: 'GJ/DR/2020/551',
      },
    }),
    db.manufacturer.upsert({
      where: { id: '20000000-0000-0000-0000-000000000004' },
      update: {},
      create: {
        id: '20000000-0000-0000-0000-000000000004',
        name: 'BioCare Infusions Ltd.',
        address: 'MIDC Tarapur, Maharashtra',
        licenseNo: 'MH/BIO/2022/990',
      },
    }),
  ]);

  const [batchDextrose, batchSaline, batchRL, batchDexa, batchDNS, batchCeftriaxone] = await Promise.all([
    db.batch.upsert({
      where: {
        uniq_product_manufacturer_batch: {
          productId: dextrose.id,
          manufacturerId: visionParenteral.id,
          batchNo: 'MP251001073',
        },
      },
      update: {},
      create: {
        productId: dextrose.id,
        manufacturerId: visionParenteral.id,
        batchNo: 'MP251001073',
        mfgDate: new Date('2025-10-01'),
        expDate: new Date('2028-09-30'),
        barcodeData: '8901234567890',
      },
    }),
    db.batch.upsert({
      where: {
        uniq_product_manufacturer_batch: {
          productId: saline.id,
          manufacturerId: apexLife.id,
          batchNo: 'NS2409238',
        },
      },
      update: {},
      create: {
        productId: saline.id,
        manufacturerId: apexLife.id,
        batchNo: 'NS2409238',
        mfgDate: new Date('2024-09-15'),
        expDate: new Date('2027-08-31'),
        barcodeData: '8901234567891',
      },
    }),
    db.batch.upsert({
      where: {
        uniq_product_manufacturer_batch: {
          productId: ringerLactate.id,
          manufacturerId: visionParenteral.id,
          batchNo: 'RL2511074',
        },
      },
      update: {},
      create: {
        productId: ringerLactate.id,
        manufacturerId: visionParenteral.id,
        batchNo: 'RL2511074',
        mfgDate: new Date('2025-11-01'),
        expDate: new Date('2028-10-31'),
        barcodeData: '8901234567892',
      },
    }),
    db.batch.upsert({
      where: {
        uniq_product_manufacturer_batch: {
          productId: dexamethasone.id,
          manufacturerId: medica.id,
          batchNo: 'DX-24078',
        },
      },
      update: {},
      create: {
        productId: dexamethasone.id,
        manufacturerId: medica.id,
        batchNo: 'DX-24078',
        mfgDate: new Date('2024-06-01'),
        expDate: new Date('2027-05-31'),
        barcodeData: '8901234567893',
      },
    }),
    db.batch.upsert({
      where: {
        uniq_product_manufacturer_batch: {
          productId: dns.id,
          manufacturerId: bioCare.id,
          batchNo: 'DNS250819',
        },
      },
      update: {},
      create: {
        productId: dns.id,
        manufacturerId: bioCare.id,
        batchNo: 'DNS250819',
        mfgDate: new Date('2025-08-01'),
        expDate: new Date('2028-07-31'),
        barcodeData: '8901234567894',
      },
    }),
    db.batch.upsert({
      where: {
        uniq_product_manufacturer_batch: {
          productId: ceftriaxone.id,
          manufacturerId: medica.id,
          batchNo: 'CTX-25031',
        },
      },
      update: {},
      create: {
        productId: ceftriaxone.id,
        manufacturerId: medica.id,
        batchNo: 'CTX-25031',
        mfgDate: new Date('2025-03-10'),
        expDate: new Date('2027-02-28'),
        barcodeData: '8901234567895',
      },
    }),
  ]);

  // Check if initial reports exist or create them
  const existingCount = await db.adrReport.count();
  let baseReportId: string | null = null;

  if (existingCount < 4) {
    const report1 = await db.adrReport.create({
      data: {
        hospitalId: hospital.id,
        reporterUserId: nurse2.id,
        caseType: 'initial',
        patientInitials: 'R/M',
        patientAge: '31 yrs',
        patientSex: 'F',
        patientWeightKg: 58.5,
        reactionStartDate: new Date('2026-08-18'),
        reactionDescription: 'Chills, shivering, high fever (102.4 F) and local infusion site erythema.',
        severity: 'severe',
        status: 'escalated',
        syncStatus: 'synced',
        ward: 'Maternity Ward',
        seriousnessFlags: { hospitalization: true, medicallySignificant: true },
        outcome: 'recovering',
        medications: {
          create: [
            {
              batchId: batchDextrose.id,
              routeUsed: 'IV Infusion',
              doseUsed: '500 ml',
              frequency: 'Once',
              indication: 'Post-operative Hydration',
              actionTaken: 'withdrawn',
              causalityAssessment: 'Probable',
              rowOrder: 0,
            },
          ],
        },
      },
    });

    const report2 = await db.adrReport.create({
      data: {
        hospitalId: hospital.id,
        reporterUserId: nurse1.id,
        caseType: 'initial',
        patientInitials: 'S/R',
        patientAge: '46 yrs',
        patientSex: 'M',
        patientWeightKg: 68.0,
        reactionStartDate: new Date('2026-08-10'),
        reactionDescription: 'Diffuse pruritic rash and facial flushing 20 minutes following start of IV Saline infusion.',
        severity: 'moderate',
        status: 'under_review',
        syncStatus: 'synced',
        ward: 'Medical Ward',
        seriousnessFlags: {},
        outcome: 'recovered',
        medications: {
          create: [
            {
              batchId: batchSaline.id,
              routeUsed: 'IV Infusion',
              doseUsed: '500 ml',
              indication: 'Dehydration',
              actionTaken: 'withdrawn',
              causalityAssessment: 'Possible',
              rowOrder: 0,
            },
          ],
        },
      },
    });

    const report3 = await db.adrReport.create({
      data: {
        hospitalId: hospital.id,
        reporterUserId: nurse1.id,
        caseType: 'initial',
        patientInitials: 'K/A',
        patientAge: '26 yrs',
        patientSex: 'F',
        patientWeightKg: 52.0,
        reactionStartDate: new Date('2026-08-20'),
        reactionDescription:
          'Violent shivering and rigors developed 15 minutes after infusion began. Infusion stopped immediately; IV hydrocortisone and pheniramine given.',
        severity: 'severe',
        status: 'under_review',
        syncStatus: 'synced',
        ward: 'Maternity Ward',
        seriousnessFlags: { lifeThreatening: false, medicallySignificant: true },
        outcome: 'recovering',
        medications: {
          create: [
            {
              batchId: batchDextrose.id,
              routeUsed: 'IV Infusion',
              doseUsed: '100 ml (stopped early)',
              indication: 'Maintenance Hydration',
              actionTaken: 'withdrawn',
              causalityAssessment: 'Probable',
              rowOrder: 0,
            },
          ],
        },
        amendments: {
          create: [
            {
              fieldName: 'Causality Assessment',
              oldValue: 'Unassessed',
              newValue: 'Probable (WHO-UMC criteria)',
              editedById: adrHead.id,
            },
          ],
        },
      },
    });

    baseReportId = report3.id;

    // Follow-up case linked to report3
    await db.adrReport.create({
      data: {
        hospitalId: hospital.id,
        reporterUserId: nurse1.id,
        caseType: 'follow_up',
        parentReportId: report3.id,
        patientInitials: 'K/A',
        patientAge: '26 yrs',
        patientSex: 'F',
        patientWeightKg: 52.0,
        reactionStartDate: new Date('2026-08-20'),
        reactionRecoveryDate: new Date('2026-08-21'),
        reactionDescription:
          'Follow-up: Rigors fully subsided within 2 hours of antihistamine therapy. Patient afebrile, vitals stable (BP 118/76, HR 78). No residual symptoms.',
        severity: 'mild',
        status: 'closed',
        syncStatus: 'synced',
        ward: 'Maternity Ward',
        seriousnessFlags: {},
        outcome: 'recovered',
        medications: {
          create: [
            {
              batchId: batchDextrose.id,
              routeUsed: 'IV Infusion',
              doseUsed: '100 ml',
              indication: 'Maintenance Hydration',
              actionTaken: 'withdrawn',
              causalityAssessment: 'Probable',
              rowOrder: 0,
            },
          ],
        },
      },
    });

    // Pharmacovigilance forwarding record
    await db.forwardingRecord.create({
      data: {
        adrReportId: report1.id,
        forwardedTo: 'pvpi_regulatory',
        referenceNo: 'PVPI-MP-2026-0891',
        notes: 'Three clustered pyrogenic reactions identified for batch MP251001073. Escalated to CDSCO/PvPI state monitoring centre.',
        forwardedById: adrHead.id,
      },
    });
  }

  // Safety Notices from Admin to Nurses
  const activeNotice = await db.safetyNotice.findFirst({ where: { active: true } });
  if (!activeNotice) {
    await db.safetyNotice.create({
      data: {
        title: 'URGENT RECALL ADVISORY: Dextrose 5% Batch MP251001073',
        message:
          'Three pyrogenic shivering reactions linked to Vision Parenteral Batch MP251001073 have been confirmed in Maternity Ward. Please quarantine all remaining bottles immediately and switch to alternate stock.',
        severity: 'critical',
        batchId: batchDextrose.id,
        active: true,
        createdById: admin.id,
      },
    });

    await db.safetyNotice.create({
      data: {
        title: 'Clinical Vigilance Notice: Rapid IV Infusion Monitoring',
        message:
          'All nursing staff are advised to monitor patient vitals at 5 min, 15 min, and 30 min after initiating any new IV fluid infusion and report any rigors or pyrexia immediately through ADRConnect.',
        severity: 'info',
        active: true,
        createdById: admin.id,
      },
    });
  }

  console.log('Seed completed successfully with enriched pharmacovigilance data!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
