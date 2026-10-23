import { NextRequest, NextResponse } from 'next/server';
import { getMembersFromStorage, refreshMembersFromDb } from '@/lib/members';
import { getShootersFromStorage, refreshShootersFromDb } from '@/lib/shooters';
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

    // Always check against the latest database records (not a stale server cache)
    await Promise.all([refreshMembersFromDb(0), refreshShootersFromDb(0)]);
    
    // 1. Executive override check (site owners)
    const execOverrides: Record<string, { pin: string; memberId: string; name: string; role: string; division: string; rifleSetup: string; badgeText: string }> = {
      'RADAR': { pin: '2468', memberId: 'SS-2026-0001', name: 'Rob Neilson', role: 'MASTER_OWNER', division: 'Master Admin', rifleSetup: 'Systems & Infrastructure Architecture (Non-Shooter)', badgeText: 'MASTER ADMIN' },
      'ROB': { pin: '2468', memberId: 'SS-2026-0001', name: 'Rob Neilson', role: 'MASTER_OWNER', division: 'Master Admin', rifleSetup: 'Systems & Infrastructure Architecture (Non-Shooter)', badgeText: 'MASTER ADMIN' },
      'SUBX': { pin: '620620', memberId: 'SS-PRO-SUBX', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
      'ALLEN': { pin: '620620', memberId: 'SS-PRO-SUBX', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
      'AHURLEY': { pin: '620620', memberId: 'SS-PRO-SUBX', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
      'HURLEY': { pin: '620620', memberId: 'SS-PRO-SUBX', name: 'Allen Hurley', role: 'OWNER_ADMIN', division: 'Owner Admin / Executive', rifleSetup: 'Modacam Custom Precision V-22 / ZCO 527', badgeText: 'OWNER ADMIN' },
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
            : ['SUBX', 'ALLEN', 'AHURLEY', 'HURLEY'].includes(key)
            ? 'SUBX'
            : cleanCallsign;

          const execShooter = getShootersFromStorage().find(
            (s) =>
              s.callsign?.toUpperCase() === finalCallsign ||
              s.id?.toLowerCase() === finalCallsign.toLowerCase()
          );

          const execRes = NextResponse.json({
            authenticated: true,
            profile: {
              name: exec.name,
              callsign: finalCallsign,
              role: exec.role,
              division: exec.division,
              rifleSetup: exec.rifleSetup,
              badgeText: exec.badgeText,
              image: execShooter?.image || undefined,
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
          execRes.cookies.set('subsonic_member_callsign', finalCallsign, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
            sameSite: 'lax',
          });
          return execRes;
        }
      }
    }
    
    // 2. Check against members and shooters databases (match by Callsign, Full Name, or Email)
    const rawIdentifier = callsign.trim();
    const lowerIdentifier = rawIdentifier.toLowerCase();
    const members = getMembersFromStorage();
    const shooters = getShootersFromStorage();

    let shooter = shooters.find((s) => s.callsign?.toUpperCase() === cleanCallsign);
    let member = members.find((m) => m.callsign?.toUpperCase() === cleanCallsign);

    // Fallback: if shooter typed their Full Name or Email Address instead of Callsign
    if (!shooter && !member) {
      shooter = shooters.find(
        (s) =>
          s.name?.trim().toLowerCase() === lowerIdentifier ||
          (s.email && s.email.trim().toLowerCase() === lowerIdentifier) ||
          ((s.rifleSetup as any)?.contactInfo?.email &&
            String((s.rifleSetup as any).contactInfo.email).trim().toLowerCase() === lowerIdentifier)
      );
      member = members.find(
        (m) =>
          m.full_name?.trim().toLowerCase() === lowerIdentifier ||
          (m.email && m.email.trim().toLowerCase() === lowerIdentifier)
      );
      if (shooter && !member && shooter.callsign) {
        member = members.find((m) => m.callsign?.toUpperCase() === shooter!.callsign.toUpperCase());
      } else if (member && !shooter && member.callsign) {
        shooter = shooters.find((s) => s.callsign?.toUpperCase() === member!.callsign?.toUpperCase());
      }
    }

    const resolvedCallsign = (shooter?.callsign || member?.callsign || cleanCallsign).toUpperCase();

    // If neither a shooter profile nor a member record exists, let them know their profile hasn't been published yet
    if (!shooter && !member) {
      return NextResponse.json(
        {
          error: `No published shooter profile found for "${rawIdentifier}" yet. If you started signing up and didn't click Publish at the bottom, tap "Finish Pro Shooter Sign-Up" below.`,
          code: 'PROFILE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

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
    
    // Check if member/shooter exists — allow Master Shooter Override PIN (7500 / subsonic2026 / SS-PRO-ZKHZ)
    if (!pinValid && (member || shooter)) {
      if (cleanPin === '7500' || cleanPin.toLowerCase() === 'subsonic2026') {
        pinValid = true;
      }
      // Accept invite-format codes
      if (cleanPin.toUpperCase().startsWith('SS-') || cleanPin.toUpperCase().includes('VIP') || cleanPin.toUpperCase().includes('HIDE')) {
        pinValid = true;
      }
    }
    
    // General beta fallback PIN (admin PINs are intentionally NOT accepted here)
    if (!pinValid && (cleanPin === '7500' || cleanPin.toLowerCase() === 'subsonic2026')) {
      pinValid = true;
    }
    
    if (!pinValid) {
      return NextResponse.json(
        {
          error: 'Incorrect PIN. Tap "Forgot PIN?" below to reset your PIN immediately.',
          code: 'INVALID_PIN',
          callsign: resolvedCallsign,
        },
        { status: 401 }
      );
    }
    
    // Build response
    const profileData = {
      name: shooter?.name || member?.full_name || resolvedCallsign,
      callsign: resolvedCallsign,
      // Keep elevated roles (admin, moderator, MD…); otherwise competitors with a profile are PRO
      role: member?.role && member.role !== 'MEMBER'
        ? member.role
        : shooter ? 'PRO_COMPETITOR' : 'MEMBER',
      division: shooter?.division || member?.experience_level || 'Open Division',
      rifleSetup: [shooter?.rifleSetup?.action, shooter?.rifleSetup?.optic].filter(Boolean).join(' / ')
        || member?.rifle_setup || '',
      badgeText: member?.role === 'MASTER_OWNER' ? 'MASTER ADMIN' 
        : member?.role === 'OWNER_ADMIN' ? 'OWNER ADMIN' 
        : shooter ? 'PRO SHOOTER' : 'SOCIETY MEMBER',
      image: shooter?.image,
    };
    
    const memberData = member ? {
      member_id: member.member_id,
      full_name: member.full_name,
      callsign: member.callsign || resolvedCallsign,
      state: member.state,
      experience_level: member.experience_level,
      rifle_setup: member.rifle_setup,
      created_at: member.created_at,
    } : null;
    
    const response = NextResponse.json({
      authenticated: true,
      profile: profileData,
      member: memberData,
    });
    response.cookies.set('subsonic_member_callsign', resolvedCallsign, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('Chat auth error:', error);
    return NextResponse.json({ error: 'Authentication service error.' }, { status: 500 });
  }
}
