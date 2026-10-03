import { NextRequest, NextResponse } from 'next/server';
import { getMembersFromStorage } from '@/lib/members';
import { getShootersFromStorage } from '@/lib/shooters';
import { verifyPin, isHashedPin } from '@/lib/pin-hash';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { callsign, pin } = await req.json();
    
    if (!callsign?.trim() || !pin?.trim()) {
      return NextResponse.json({ error: 'Callsign and PIN are required.' }, { status: 400 });
    }
    
    const cleanCallsign = callsign.trim().toUpperCase();
    const cleanPin = pin.trim();
    
    // 1. Executive override check (site owners)
    const execOverrides: Record<string, { pin: string; memberId: string; name: string; role: string; division: string; rifleSetup: string; badgeText: string }> = {
      'RADAR': { pin: '2468', memberId: 'SS-2026-0001', name: 'Rob Neilson', role: 'MASTER_OWNER', division: 'Master Admin', rifleSetup: 'Systems & Infrastructure Architecture (Non-Shooter)', badgeText: 'MASTER ADMIN' },
      'ROB': { pin: '2468', memberId: 'SS-2026-0001', name: 'Rob Neilson', role: 'MASTER_OWNER', division: 'Master Admin', rifleSetup: 'Systems & Infrastructure Architecture (Non-Shooter)', badgeText: 'MASTER ADMIN' },
      'LTDAN': { pin: '2468', memberId: 'SS-2026-0001', name: 'Rob Neilson', role: 'MASTER_OWNER', division: 'Master Admin', rifleSetup: 'Systems & Infrastructure Architecture (Non-Shooter)', badgeText: 'MASTER ADMIN' },
      'SAID DONE': { pin: '620620', memberId: 'SS-2026-0002', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
      'SAIDDONE': { pin: '620620', memberId: 'SS-2026-0002', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
      'ALLEN': { pin: '620620', memberId: 'SS-2026-0002', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
      'AHURLEY': { pin: '620620', memberId: 'SS-2026-0002', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
      'HURLEY': { pin: '620620', memberId: 'SS-2026-0002', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
    };
    
    // Check executive aliases
    const execKeys = Object.keys(execOverrides);
    for (const key of execKeys) {
      if (cleanCallsign === key || (key.length >= 4 && cleanCallsign.includes(key))) {
        const exec = execOverrides[key];

        // If the admin has reset their PIN in the dashboard (4–6 digits), that saved
        // PIN replaces the built-in default. Otherwise the default PIN applies.
        const execRecord = getMembersFromStorage().find((m) => m.member_id === exec.memberId);
        const savedPin = execRecord?.pin ? String(execRecord.pin).trim() : "";
        let execPinValid = false;
        if (savedPin) {
          execPinValid = isHashedPin(savedPin) ? await verifyPin(cleanPin, savedPin) : cleanPin === savedPin;
        } else {
          execPinValid = cleanPin === exec.pin;
        }

        if (!execPinValid) {
          // Exact executive callsign: never fall through to member/beta fallbacks.
          if (cleanCallsign === key) {
            return NextResponse.json(
              { error: 'Invalid Callsign or PIN.' },
              { status: 401 }
            );
          }
          // Partial match (e.g. a member callsign containing "ALLEN"): keep checking normally.
          continue;
        }

        {
          const finalCallsign = (key === 'ROB' || key === 'LTDAN' || key === 'RADAR')
            ? 'RADAR'
            : ['SAID DONE', 'SAIDDONE', 'ALLEN', 'AHURLEY', 'HURLEY'].includes(key)
            ? 'SAID DONE'
            : cleanCallsign;

          return NextResponse.json({
            authenticated: true,
            profile: {
              name: exec.name,
              callsign: finalCallsign,
              role: exec.role,
              division: exec.division,
              rifleSetup: exec.rifleSetup,
              badgeText: exec.badgeText,
            },
            member: {
              member_id: exec.memberId,
              full_name: exec.name,
              callsign: finalCallsign,
              state: 'TN',
              experience_level: exec.division,
              rifle_setup: exec.rifleSetup,
              created_at: '2026-07-04T12:00:00Z',
            },
          });
        }
      }
    }
    
    // 2. Check against members database
    const members = getMembersFromStorage();
    const member = members.find(m => m.callsign?.toUpperCase() === cleanCallsign);
    
    // 3. Check against shooters database (shooters have pin_hash)
    const shooters = getShootersFromStorage();
    const shooter = shooters.find(s => s.callsign?.toUpperCase() === cleanCallsign);
    
    // 4. Verify PIN
    let pinValid = false;
    
    // Check shooter's hashed PIN
    if (shooter?.pin) {
      const storedPin = String(shooter.pin);
      if (isHashedPin(storedPin)) {
        pinValid = await verifyPin(cleanPin, storedPin);
      } else {
        // Plain text PIN (legacy)
        pinValid = cleanPin === storedPin;
      }
    }

    // Check member's configured PIN
    if (!pinValid && member?.pin) {
      const storedPin = String(member.pin);
      if (isHashedPin(storedPin)) {
        pinValid = await verifyPin(cleanPin, storedPin);
      } else {
        pinValid = cleanPin === storedPin;
      }
    }
    
    // Check if member exists even without shooter profile
    if (!pinValid && member) {
      // Beta fallback: accept subsonic2026 for any registered member
      if (cleanPin.toLowerCase() === 'subsonic2026') {
        pinValid = true;
      }
      // Accept invite-format codes
      if (cleanPin.startsWith('SS-') || cleanPin.includes('VIP') || cleanPin.includes('HIDE')) {
        pinValid = true;
      }
    }
    
    // General beta fallback PIN (admin PINs are intentionally NOT accepted here)
    if (!pinValid && cleanPin.toLowerCase() === 'subsonic2026') {
      pinValid = true;
    }
    
    if (!pinValid) {
      return NextResponse.json(
        { error: 'Invalid Callsign or PIN. If you have an invite code, use the Claim Member Code option.' },
        { status: 401 }
      );
    }
    
    // Build response
    const profileData = {
      name: shooter?.name || member?.full_name || cleanCallsign,
      callsign: cleanCallsign,
      role: member?.role || shooter?.division ? 'PRO_COMPETITOR' : 'MEMBER',
      division: shooter?.division || member?.experience_level || 'Open Division',
      rifleSetup: shooter?.rifleSetup 
        ? `${shooter.rifleSetup.action || 'Precision Rig'} / ${shooter.rifleSetup.optic || 'Optic'}` 
        : member?.rifle_setup || 'Precision Rimfire',
      badgeText: member?.role === 'MASTER_OWNER' ? 'MASTER ADMIN' 
        : member?.role === 'OWNER_ADMIN' ? 'OWNER ADMIN' 
        : shooter ? 'PRO SHOOTER' : 'SOCIETY MEMBER',
      image: shooter?.image,
    };
    
    const memberData = member ? {
      member_id: member.member_id,
      full_name: member.full_name,
      callsign: member.callsign,
      state: member.state,
      experience_level: member.experience_level,
      rifle_setup: member.rifle_setup,
      created_at: member.created_at,
    } : null;
    
    return NextResponse.json({
      authenticated: true,
      profile: profileData,
      member: memberData,
    });
  } catch (error) {
    console.error('Chat auth error:', error);
    return NextResponse.json({ error: 'Authentication service error.' }, { status: 500 });
  }
}
