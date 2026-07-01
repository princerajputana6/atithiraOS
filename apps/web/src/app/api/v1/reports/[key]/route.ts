import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@atithira/core-security";
import { getReport, toCsv } from "@atithira/core-reporting";
import { ensureBootstrapped } from "@/lib/bootstrap";

const protectedGet = requirePermission<{ params: Promise<{ key: string }> }>(
  PERMISSIONS.REPORTING_READ,
)(
  async (req: Request, ctx: { params: Promise<{ key: string }> }) => {
    const { key } = await ctx.params;
    const report = getReport(key);
    if (!report) {
      return NextResponse.json({ error: "Unknown report" }, { status: 404 });
    }

    const params = Object.fromEntries(new URL(req.url).searchParams);
    const rows = await report.run(params);

    if (params.format === "csv") {
      return new NextResponse(toCsv(rows), {
        headers: {
          "content-type": "text/csv",
          "content-disposition": `attachment; filename="${key}.csv"`,
        },
      });
    }
    return NextResponse.json({ rows });
  },
);

export async function GET(
  req: Request,
  ctx: { params: Promise<{ key: string }> },
) {
  await ensureBootstrapped();
  return protectedGet(req, ctx);
}
