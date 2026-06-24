// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "YunoCheckout",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "YunoCheckout",
            targets: ["YunoCheckout"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/yuno-payments/yuno-sdk-ios.git", from: "2.18.0")
    ],
    targets: [
        .target(
            name: "YunoCheckout",
            dependencies: [
                .product(name: "YunoSDK", package: "yuno-sdk-ios")
            ]
        ),
    ]
)
