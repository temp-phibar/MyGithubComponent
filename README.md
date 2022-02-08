# EAMD ucp Component template


## default structure


```
  Default Structure                           | Description
==============================================+=================================================                           
                                              | the default structure containing all the  
.                                             |   units for this component
├── LICENSE                                   | MANDATORY text file containing the license for your component
|  ├── README.md                              | the file you just read
├── package.json                              | the optional npm package description  
|                                             |   (may be generated from the UcpComponentDescriptor)
├── src                                       | 
│   ├── 1_infrastructure                      | 
│   │   └── BaseSystem.class.ts               | abstact class BaseSystem implements System
│   ├── 2_systems                             | 
│   │   └── DefaultSystem.class.ts            | class DefaultSystem extend BaseSystem     (implements System)
│   │   └── SpecialSystem.class.ts            | class SpecialSystem extend DefaultSystem 
│   │   └── StaticStartableSystem.class.ts    | export const StaticStartable: SystemStatics = 
|   |                                         |    class StaticStartableSystem extends DefaultSystem  {...
│   ├── 3_services                            | 
│   │   └── System.interface.ts               | contains 
│   │                                         |    1. System enumms:      
|   |                                         |             e.g. enum SYSTEM_STATES {
|   |                                         |                                
|   |                                         |                    STARTED = "System started",
|   |                                         |                    STOPED = "System stopped",
|   |                                         |                  }
|   |                                         |    2. the static part of a Systems interface
|   |                                         |             e.g. export interface SystemStatics {
|   |                                         |                       start(env: Environment): System
|   |                                         |                  }
|   |                                         |    3. the instance part of a Systems interface
|   |                                         |             e.g. export interface System {
|   |                                         |                       init(env: Environment): System
|   |                                         |                       processCall(...args): Response
|   |                                         |                       ...
|   |                                         |                  }
│   │                                         | 
│   │                                         | 
│   ├── 4_processes                           | Here all classes go, that orchestrate SpecialSystems 
│   |                                         |   into processes e.g. classes that run
│   |                                         |   GraphQL queries or interprete BPMN processes 
│   └── 5_ux                                  | 
│       ├── view                              | Here go all unit required to create an GUI visualisation  
│       │   ├── assets                        |   e.g. pictures   
│       │   ├── css                           |        CSS/LESS/SASS
│       │   ├── html                          |        HTML Templates
│       │   └── ts                            |   and WebComponent class implementations
│       └── workflow                          | 
│           └── ts                            | Here go all calsses that interact with the process layer4 
│                                             |    or with the interface layer3.
│                                             |   NO UX CODE directly interacts with the system layer2!
└── tsconfig.json                             | 
````                          
                       

## Naming Conventions

### Intefaces

Interfaces are the **language** of the **natural world**.
They are the **visible part** of the **black box** of the component and therefore should come naturally.

Try to name them as if you describe a general Category of a Thing, Party, or Place.

The well known (a little stupid) example is: 
```
BMW      is a Car, 
Audi     is a Car and 
Mercedes is a Car.
```
Therefore Car might be the Interface and 
DefaultCar or BMWCar or AudiCar may be the implementation **classes** in 2_system level 

### Classes

Classes finally implement the Interfaces. As such they are **Implementation Details** and in ingeneral inside of the balck box,
which also means that they are **not visible** to the outside world *but only to the programmers*

You cannot instantiate and work with an interface, each interface needs at least one default implementation, why it comes natural to 
name it Default(NameOfTheInterface) so in the current example DefaultCar. This convention is also used e.g. in the Java World.

Other call it CarImpl as in Car Implementation. We like the Default prefix, because its easy to lookup in the repository. 

### References and Variables should be as often as possible of Interface types

A DefaultCar can be instantiated and is a fully functional car.

Writing reusable code implies to try to always find the most general Interface that fulfills all functional needs.
So later more Specialised or more Powerfull Cars can be added without the need that the original System knows about future Cars.
So better car implementations can be *injected* into the existing general code, much later.
```
    ... some code
    ...
    let aCar: Car = DefaultCar.getInstance.init();

    upgradeCar(aCar: Car): Car {
        let previousCarFeaturesList = aCar.featureList;
        return AudiCar.getInstance.init(previousCarFeaturesList);
    }
```
### Abstract Classes

They are here to concentrate the common functionality of all cars - to stay in our example.
They are not complete cars, but make cars more standardised...

e.g. The VW Beatle and the VW Golf and the Audi TT are all build on the 
identical common GolfPlatform which is a BaseCar with 
wheels, stearing and breaking system, gear system and the commen frame to fit these systems in.
It does not come with the car body nor any of the interior and you would not be able to drive it alone.

Threrfore these abstract classes are more general infrastructure, than really part of the system 
which can be reflected by its layer: e.g. like in BaseSystem above

```
abstarct class GolfPlatfomBaseCar extends Car {
    break() {...code...}
    shiftGearUp() {...code...}
    abstract adjustSeats()   // no seets here yet
    ...
```
