// Render the authorized PDF as a complete page, avoiding a nested browser PDF scroller.
// Usage: swift scripts/render-resume-preview.swift input.pdf output.png
import AppKit
import PDFKit
let arguments = CommandLine.arguments
 guard arguments.count == 3, let document = PDFDocument(url: URL(fileURLWithPath: arguments[1])), let page = document.page(at: 0) else { fatalError("Expected a readable resume PDF and PNG output path") }
let bounds = page.bounds(for: .mediaBox)
let scale: CGFloat = 2.5
let width = Int(bounds.width * scale), height = Int(bounds.height * scale)
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
let context = NSGraphicsContext(bitmapImageRep: bitmap)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.cgContext.setFillColor(NSColor.white.cgColor)
context.cgContext.fill(CGRect(x: 0, y: 0, width: width, height: height))
context.cgContext.scaleBy(x: scale, y: scale)
page.draw(with: .mediaBox, to: context.cgContext)
context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()
let png = bitmap.representation(using: .png, properties: [:])!
try png.write(to: URL(fileURLWithPath: arguments[2]))
print("Rendered \(document.pageCount)-page PDF, first page \(width)x\(height), \(png.count) bytes")
