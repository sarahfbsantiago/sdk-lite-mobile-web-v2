pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Yuno SDK Repository
        maven { url = uri("https://yunopayments.jfrog.io/artifactory/snapshots-libs-release") }
    }
}

rootProject.name = "YunoCheckout"
include(":app")
